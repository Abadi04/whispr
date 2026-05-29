#!/usr/bin/env bash
# Single entrypoint for every test layer. Each layer skips cleanly if its
# prerequisite (Postgres / jsdom) is unavailable, so this never hard-fails on a
# bare environment.
set -uo pipefail
cd "$(dirname "$0")/.."
fail=0

echo "== Unit + migration static tests (node --test) =="
node --test || fail=1

echo; echo "== DB integration tests (Postgres) =="
bash tests/db/run.sh || fail=1

echo; echo "== Functional browser tests (jsdom) =="
node tests/functional/run.js || fail=1

echo
if [ "$fail" = 0 ]; then echo "ALL TEST LAYERS PASSED (or skipped cleanly)"; else echo "SOME TESTS FAILED"; fi
exit $fail
