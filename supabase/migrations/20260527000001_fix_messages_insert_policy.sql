-- =============================================================
-- Fix the INSERT policy on public.messages.
--
-- The policy that landed in production requires auth.uid() = sender_id,
-- which breaks the whole product: Whispr is an *anonymous* messaging
-- app. Anonymous senders are unauthenticated (auth.uid() IS NULL) and
-- must be allowed to insert with sender_id = NULL. Authenticated users
-- can still send and must stamp the row with their own uid (so they
-- can't impersonate someone else).
-- =============================================================

drop policy if exists "messages_insert"            on public.messages;
drop policy if exists "Anyone can insert messages" on public.messages;
drop policy if exists "Anyone can send messages"   on public.messages;
drop policy if exists "Allow insert for sender"    on public.messages;

create policy "messages_insert" on public.messages
  for insert
  with check (
    -- Anonymous sender (logged-out user using the public profile link).
    sender_id is null
    or
    -- Authenticated sender stamping the row with their own id.
    auth.uid() = sender_id
  );
