-- Fix the existing messages table to match what the app expects, and work
-- around an old RLS policy that depends on the `reply` column.
-- Problems fixed: column was named `read` (app uses `is_read`); `reply` was
-- uuid (app stores text); a legacy policy ("Allow select replies") blocked the
-- type change. Safe and row-preserving — your existing messages are kept.

-- 1) Drop every existing policy on messages (names vary) so we can alter columns.
do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'messages'
  loop
    execute format('drop policy if exists %I on public.messages', p.policyname);
  end loop;
end $$;

-- 2) Rename read -> is_read (only if needed).
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='messages' and column_name='read')
     and not exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='messages' and column_name='is_read')
  then
    alter table public.messages rename column read to is_read;
  end if;
end $$;
alter table public.messages alter column is_read set default false;
update public.messages set is_read = false where is_read is null;

-- 3) reply must be text, not uuid.
alter table public.messages alter column reply type text using reply::text;

-- 4) Recreate the correct, secure policies.
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
