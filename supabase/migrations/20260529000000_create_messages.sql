-- ============================================================================
-- messages table + Row Level Security
-- ----------------------------------------------------------------------------
-- The app (app.js) reads/writes a `public.messages` table but no migration
-- existed for it, which means RLS may never have been configured. Without the
-- policies below, the anon/publishable key could read or delete EVERY user's
-- messages. This migration is idempotent and safe to run on an existing table.
-- ============================================================================

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  -- FKs reference auth.users (not public.profiles) so this migration is
  -- independent of ordering and does not require a profile row to exist.
  receiver_id uuid not null references auth.users(id) on delete cascade,
  sender_id   uuid references auth.users(id) on delete set null, -- null = anonymous
  content     text not null,
  reply       text,
  is_read     boolean not null default false,
  created_at  timestamp with time zone not null default timezone('utc'::text, now())
);

-- Server-side length / non-empty enforcement (mirrors MAX_MESSAGE_LEN in app.js).
-- Client maxlength can be bypassed by calling the REST API directly.
-- content::text cast keeps this working even if an existing table created the
-- column with a non-text type.
alter table public.messages drop constraint if exists messages_content_len;
alter table public.messages
  add constraint messages_content_len
  check (char_length(content::text) between 1 and 1000);

alter table public.messages drop constraint if exists messages_reply_len;
alter table public.messages
  add constraint messages_reply_len
  check (reply is null or char_length(reply::text) between 1 and 1000);

create index if not exists messages_receiver_created_idx
  on public.messages (receiver_id, created_at desc);

-- Index used by the public-replies query on profile pages.
create index if not exists messages_public_replies_idx
  on public.messages (receiver_id, created_at desc)
  where reply is not null;

alter table public.messages enable row level security;

-- ---- SELECT ----------------------------------------------------------------
-- 1) The receiver can read all of their own messages (the inbox).
drop policy if exists "Receiver can read own messages" on public.messages;
create policy "Receiver can read own messages" on public.messages
  for select using (auth.uid() = receiver_id);

-- 2) Anyone (including anonymous visitors) can read messages that have a public
--    reply — this powers the "previous replies" wall on a public profile.
--    Crucially, messages WITHOUT a reply stay private to the receiver.
drop policy if exists "Anyone can read replied messages" on public.messages;
create policy "Anyone can read replied messages" on public.messages
  for select using (reply is not null);

-- ---- INSERT ----------------------------------------------------------------
-- Anyone can send a message. They may send anonymously (sender_id null) or, if
-- logged in, attach ONLY their own id. This prevents spoofing another user as
-- the sender.
drop policy if exists "Anyone can send a message" on public.messages;
create policy "Anyone can send a message" on public.messages
  for insert with check (
    sender_id is null or sender_id = auth.uid()
  );

-- ---- UPDATE ----------------------------------------------------------------
-- Only the receiver may update a message (used for adding a reply / marking
-- read). Senders cannot edit or recall a message.
drop policy if exists "Receiver can update own messages" on public.messages;
create policy "Receiver can update own messages" on public.messages
  for update using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);

-- ---- DELETE ----------------------------------------------------------------
-- Only the receiver may delete their messages.
drop policy if exists "Receiver can delete own messages" on public.messages;
create policy "Receiver can delete own messages" on public.messages
  for delete using (auth.uid() = receiver_id);
