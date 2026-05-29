# DB integration tests

Exercises the real Supabase schema (`supabase/setup.sql`) against a local
PostgreSQL to prove the security model actually holds.

## Run

```bash
tests/db/run.sh
```

Requires a local PostgreSQL + `psql`. The script:

1. creates a throwaway `whispr_test` database;
2. applies `auth_stub.sql` — minimal stubs for Supabase's `auth.users`,
   `auth.uid()`, `auth.jwt()`, and the `anon` / `authenticated` roles;
3. applies `supabase/setup.sql`;
4. applies `grants.sql` — simulates Supabase's default table grants to
   `anon` / `authenticated` (RLS still applies on top);
5. runs `assertions.sql`.

If `psql` is not installed the script exits 0 (skips), so it never blocks
environments without a database.

## What the assertions verify

| # | Check |
|---|-------|
| T1 | The receiver can read all of their own messages |
| T2 | A non-receiver can read **only** messages that have a public reply |
| T3 | Anonymous visitors can read **only** replied messages |
| T4 | A logged-in sender cannot spoof someone else's `sender_id` |
| T5 | Over-length content is rejected by the server-side CHECK constraint |
| T6 | `get_admin_stats()` rejects non-owner callers |
| T7 | `get_admin_stats()` returns correct global counts for the owner |

> Note: `auth_stub.sql` and `grants.sql` only emulate what Supabase provides in
> production — they are test scaffolding and are **not** part of the deployed
> schema.
