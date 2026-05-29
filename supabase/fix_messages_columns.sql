-- Fix the existing messages table to match what the app expects.
-- Problem found: column was named `read` (app uses `is_read`) and `reply` was
-- uuid (app stores text). Safe and idempotent-ish; preserves existing rows.

-- 1) Rename read -> is_read (only if the old column still exists)
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

-- 2) reply must be text, not uuid
alter table public.messages alter column reply type text using reply::text;
