#!/usr/bin/env bash
# DB integration tests for Whispr's Supabase schema.
#
# Spins up a throwaway database, stubs Supabase's `auth` schema + roles, applies
# supabase/setup.sql, then runs RLS / sender-spoofing / length / owner-stats
# assertions. Requires a local PostgreSQL and `psql`.
#
# Usage:  tests/db/run.sh            (uses `su - postgres`)
#         PSQL="psql -U me" tests/db/run.sh
#
# Skips (exit 0) if psql is unavailable so it never blocks environments
# without a database.
set -euo pipefail
cd "$(dirname "$0")/../.."

if ! command -v psql >/dev/null 2>&1; then
  echo "SKIP: psql not found — DB integration tests skipped."
  exit 0
fi

DB=whispr_test
# Run as the postgres superuser by default (works in the standard container).
run() { su - postgres -c "psql -v ON_ERROR_STOP=1 -q -d $DB $*"; }

su - postgres -c "dropdb --if-exists $DB; createdb $DB" >/dev/null

# Copy SQL to a postgres-readable location (the repo may not be readable by the
# postgres user).
# Use a world-readable temp dir under /tmp so the `postgres` user can read it.
TMP=$(mktemp -d -p /tmp whispr_db.XXXXXX); chmod 755 "$TMP"
cp tests/db/auth_stub.sql tests/db/grants.sql tests/db/assertions.sql supabase/setup.sql "$TMP"/; chmod 644 "$TMP"/*.sql

run "-f $TMP/auth_stub.sql"   >/dev/null
run "-f $TMP/setup.sql"       >/dev/null
run "-f $TMP/grants.sql"      >/dev/null

OUT=$(run "-f $TMP/assertions.sql" 2>&1)
echo "$OUT" | grep -E "PASS|FAIL" || true
rm -rf "$TMP"

if echo "$OUT" | grep -q "FAIL"; then echo "DB TESTS FAILED"; exit 1; fi
PASSES=$(echo "$OUT" | grep -c "PASS" || true)
echo "DB TESTS PASSED ($PASSES assertions)"
