-- ============================================================================
-- Whispr — full database bootstrap (run ONCE in the Supabase SQL Editor)
-- ----------------------------------------------------------------------------
-- Idempotent and ordered: profiles -> messages -> blocks -> admin stats.
-- Safe to re-run. This is the single source of truth that combines every
-- migration in supabase/migrations/ in the correct dependency order, so you do
-- not have to paste files one by one or worry about ordering.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) PROFILES (must exist first: usernames, avatars, owner email)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row on signup.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles for users who registered before the table existed.
insert into public.profiles (id, email, full_name, avatar_url)
select id, email, raw_user_meta_data->>'full_name', raw_user_meta_data->>'avatar_url'
from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2) MESSAGES (+ strict RLS + server-side length limits)
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  receiver_id uuid not null references auth.users(id) on delete cascade,
  sender_id   uuid references auth.users(id) on delete set null, -- null = anonymous
  content     text not null,
  reply       text,
  is_read     boolean not null default false,
  created_at  timestamp with time zone not null default timezone('utc'::text, now())
);

alter table public.messages drop constraint if exists messages_content_len;
alter table public.messages
  add constraint messages_content_len check (char_length(content) between 1 and 1000);

alter table public.messages drop constraint if exists messages_reply_len;
alter table public.messages
  add constraint messages_reply_len check (reply is null or char_length(reply) between 1 and 1000);

create index if not exists messages_receiver_created_idx
  on public.messages (receiver_id, created_at desc);
create index if not exists messages_public_replies_idx
  on public.messages (receiver_id, created_at desc) where reply is not null;

alter table public.messages enable row level security;

drop policy if exists "Receiver can read own messages" on public.messages;
create policy "Receiver can read own messages" on public.messages
  for select using (auth.uid() = receiver_id);

drop policy if exists "Anyone can read replied messages" on public.messages;
create policy "Anyone can read replied messages" on public.messages
  for select using (reply is not null);

drop policy if exists "Anyone can send a message" on public.messages;
create policy "Anyone can send a message" on public.messages
  for insert with check (sender_id is null or sender_id = auth.uid());

drop policy if exists "Receiver can update own messages" on public.messages;
create policy "Receiver can update own messages" on public.messages
  for update using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);

drop policy if exists "Receiver can delete own messages" on public.messages;
create policy "Receiver can delete own messages" on public.messages
  for delete using (auth.uid() = receiver_id);

-- ---------------------------------------------------------------------------
-- 3) BLOCKS (+ RLS)
-- ---------------------------------------------------------------------------
create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(blocker_id, blocked_id)
);

alter table public.blocks enable row level security;

drop policy if exists "Users can view their own blocks" on public.blocks;
create policy "Users can view their own blocks" on public.blocks
  for select using (auth.uid() = blocker_id);

drop policy if exists "Users can insert their own blocks" on public.blocks;
create policy "Users can insert their own blocks" on public.blocks
  for insert with check (auth.uid() = blocker_id);

drop policy if exists "Users can delete their own blocks" on public.blocks;
create policy "Users can delete their own blocks" on public.blocks
  for delete using (auth.uid() = blocker_id);

-- ---------------------------------------------------------------------------
-- 4) OWNER-EXCLUSIVE ANALYTICS (SECURITY DEFINER, gated by owner email)
-- ---------------------------------------------------------------------------
create or replace function public.get_admin_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_email text;
  result json;
begin
  caller_email := auth.jwt() ->> 'email';
  if caller_email is distinct from 'abadihdar@gmail.com' then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select json_build_object(
    'total_users',      (select count(*) from public.profiles),
    'total_messages',   (select count(*) from public.messages),
    'messages_last_7d', (select count(*) from public.messages where created_at >= now() - interval '7 days'),
    'active_users_7d',  (select count(distinct receiver_id) from public.messages where created_at >= now() - interval '7 days'),
    'replied_messages', (select count(*) from public.messages where reply is not null)
  ) into result;
  return result;
end;
$$;

revoke all on function public.get_admin_stats() from public, anon;
grant execute on function public.get_admin_stats() to authenticated;
