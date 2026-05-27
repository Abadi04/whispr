-- =============================================================
-- Messages table + RLS that actually lets receivers read their
-- own messages, lets anyone (anon) send, and lets the receiver
-- update (reply / mark read) and delete their own messages.
-- =============================================================

-- 1) Make sure the messages table exists with the schema the app uses.
--    If it already exists with a slightly different shape we just add the
--    missing pieces so we don't lose data.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete set null,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  reply text,
  is_read boolean not null default false,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Backfill any historic columns/types/defaults that might be missing on an
-- older table (idempotent).
alter table public.messages add column if not exists sender_id uuid;
alter table public.messages add column if not exists receiver_id uuid;
alter table public.messages add column if not exists content text;
alter table public.messages add column if not exists reply text;
alter table public.messages add column if not exists is_read boolean not null default false;
alter table public.messages add column if not exists created_at timestamp with time zone not null default timezone('utc'::text, now());

create index if not exists messages_receiver_idx on public.messages (receiver_id, created_at desc);
create index if not exists messages_sender_idx   on public.messages (sender_id);

-- 2) Enable RLS and rebuild the policies from scratch so we know the state.
alter table public.messages enable row level security;

drop policy if exists "Anyone can insert messages"           on public.messages;
drop policy if exists "Anyone can send messages"             on public.messages;
drop policy if exists "Users can view their own messages"    on public.messages;
drop policy if exists "Receivers can read their messages"    on public.messages;
drop policy if exists "Public replies are readable"          on public.messages;
drop policy if exists "Receivers can update their messages"  on public.messages;
drop policy if exists "Receivers can delete their messages"  on public.messages;
drop policy if exists "messages_insert"                      on public.messages;
drop policy if exists "messages_select_receiver"             on public.messages;
drop policy if exists "messages_select_public_replies"       on public.messages;
drop policy if exists "messages_update_receiver"             on public.messages;
drop policy if exists "messages_delete_receiver"             on public.messages;

-- INSERT: anyone (anon or authenticated) can send a message as long as
-- the receiver exists. If they are authenticated their sender_id must be
-- their own auth uid (so they can't impersonate). Anonymous senders must
-- leave sender_id NULL.
create policy "messages_insert" on public.messages
  for insert
  with check (
    receiver_id is not null
    and exists (select 1 from public.profiles p where p.id = receiver_id)
    and (
      (auth.uid() is null and sender_id is null)
      or
      (auth.uid() is not null and (sender_id is null or sender_id = auth.uid()))
    )
  );

-- SELECT: the receiver can read everything addressed to them.
create policy "messages_select_receiver" on public.messages
  for select
  using (auth.uid() = receiver_id);

-- SELECT: anyone can read messages that have a public reply (used to
-- render the "previous replies" section on the public profile page).
create policy "messages_select_public_replies" on public.messages
  for select
  using (reply is not null);

-- UPDATE: only the receiver can update (reply / mark read).
create policy "messages_update_receiver" on public.messages
  for update
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

-- DELETE: only the receiver can delete their own messages.
create policy "messages_delete_receiver" on public.messages
  for delete
  using (auth.uid() = receiver_id);

-- 3) Add the table to the realtime publication so the app can subscribe
--    to live inserts/updates on the inbox.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      execute 'alter publication supabase_realtime add table public.messages';
    exception when duplicate_object then
      -- already part of the publication, ignore
      null;
    end;
  end if;
end$$;
