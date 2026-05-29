-- ============================================================================
-- Owner-exclusive analytics: get_admin_stats()
-- ----------------------------------------------------------------------------
-- The analytics dashboard must show GLOBAL counts (all users / all messages),
-- but the messages RLS (see 20260529000000_create_messages.sql) correctly
-- prevents any client from reading other users' rows. A SECURITY DEFINER
-- function bypasses RLS safely, and gates access to the project owner ONLY by
-- checking the caller's authenticated email server-side — so the exclusivity
-- is enforced by the database, not just by hiding a button in the UI.
-- ============================================================================

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
  -- The owner's email is taken from the verified JWT, not from any client input.
  caller_email := auth.jwt() ->> 'email';

  if caller_email is distinct from 'abadihdar@gmail.com' then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select json_build_object(
    'total_users',        (select count(*) from public.profiles),
    'total_messages',     (select count(*) from public.messages),
    'messages_last_7d',   (select count(*) from public.messages
                              where created_at >= now() - interval '7 days'),
    'active_users_7d',    (select count(distinct receiver_id) from public.messages
                              where created_at >= now() - interval '7 days'),
    'replied_messages',   (select count(*) from public.messages where reply is not null)
  ) into result;

  return result;
end;
$$;

-- Authenticated users may CALL the function, but the body still rejects anyone
-- who is not the owner. Anonymous role is intentionally not granted.
revoke all on function public.get_admin_stats() from public, anon;
grant execute on function public.get_admin_stats() to authenticated;
