-- ============================================================================
-- DEFINITIVE RESET of public.messages
-- ----------------------------------------------------------------------------
-- Instead of adapting to an unknown legacy table (wrong column names/types and
-- stale policies), this drops it and rebuilds it EXACTLY as the app expects.
-- Deterministic: the end state does not depend on the previous schema.
--
-- WARNING: this deletes existing rows in public.messages. That is intended here
-- because the table only holds test data. Do NOT run on a table with real data
-- you want to keep.
-- ============================================================================

drop table if exists public.messages cascade;

create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  receiver_id uuid not null references auth.users(id) on delete cascade,
  sender_id   uuid references auth.users(id) on delete set null, -- null = anonymous
  content     text not null,
  reply       text,
  is_read     boolean not null default false,
  created_at  timestamp with time zone not null default timezone('utc'::text, now())
);

alter table public.messages
  add constraint messages_content_len check (char_length(content) between 1 and 1000);
alter table public.messages
  add constraint messages_reply_len check (reply is null or char_length(reply) between 1 and 1000);

create index messages_receiver_created_idx on public.messages (receiver_id, created_at desc);
create index messages_public_replies_idx  on public.messages (receiver_id, created_at desc) where reply is not null;

alter table public.messages enable row level security;

create policy "Receiver can read own messages" on public.messages
  for select using (auth.uid() = receiver_id);
create policy "Anyone can read replied messages" on public.messages
  for select using (reply is not null);
create policy "Anyone can send a message" on public.messages
  for insert with check (sender_id is null or sender_id = auth.uid());
create policy "Receiver can update own messages" on public.messages
  for update using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);
create policy "Receiver can delete own messages" on public.messages
  for delete using (auth.uid() = receiver_id);

-- Table-level access for the API roles (RLS still controls which rows).
grant select, insert, update, delete on public.messages to anon, authenticated;

-- Verification: shows the final, correct column layout.
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'messages'
order by ordinal_position;
