-- Simulates Supabase's default grants to anon/authenticated. RLS still applies on top.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
