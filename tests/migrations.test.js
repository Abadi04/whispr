// Static dependency-order check for the SQL migrations — runs with `node --test`
// and needs no database. This is the test that would have caught the bug where
// `create_blocks` (which references another table) ran BEFORE that table was
// created, because its filename sorted earlier.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const MIG_DIR = path.join(__dirname, '..', 'supabase', 'migrations');
const files = fs.readdirSync(MIG_DIR).filter(f => f.endsWith('.sql')).sort();

// Read a migration with SQL comments stripped, so the linter never matches
// keywords that only appear in explanatory comments.
function readSql(file) {
  return fs.readFileSync(path.join(MIG_DIR, file), 'utf8')
    .replace(/--[^\n]*/g, '')        // line comments
    .replace(/\/\*[\s\S]*?\*\//g, ''); // block comments
}

function tablesCreatedIn(sql) {
  const re = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?("?\w+"?)/gi;
  const out = [];
  let m;
  while ((m = re.exec(sql))) out.push(m[1].replace(/"/g, '').toLowerCase());
  return out;
}

function referencesIn(sql) {
  // Captures `references <schema.table>` or `references <table>`.
  const re = /references\s+([a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*)?)/gi;
  const out = [];
  let m;
  while ((m = re.exec(sql))) out.push(m[1].toLowerCase());
  return out;
}

test('every FK reference resolves to a table created earlier (in sort order)', () => {
  const created = new Set();
  for (const file of files) {
    const sql = readSql(file);
    for (const ref of referencesIn(sql)) {
      // auth.* tables (auth.users) are provided by Supabase and always exist.
      if (ref.startsWith('auth.')) continue;
      const bare = ref.replace(/^public\./, '');
      assert.ok(
        created.has(bare),
        `Migration "${file}" references public.${bare} before it is created. ` +
        `Either reference auth.users or reorder migrations.`
      );
    }
    for (const t of tablesCreatedIn(sql)) created.add(t);
  }
});

test('migrations use gen_random_uuid (built-in), not uuid_generate_v4', () => {
  for (const file of files) {
    const sql = readSql(file);
    assert.ok(
      !/uuid_generate_v4/i.test(sql),
      `Migration "${file}" uses uuid_generate_v4() (needs uuid-ossp). Use gen_random_uuid().`
    );
  }
});

test('no migration references the non-existent public.users table', () => {
  for (const file of files) {
    const sql = readSql(file);
    assert.ok(
      !/references\s+public\.users\b/i.test(sql),
      `Migration "${file}" references public.users which does not exist (use auth.users).`
    );
  }
});

test('owner-stats function is gated by the owner email', () => {
  const f = files.find(x => x.includes('admin_stats'));
  assert.ok(f, 'admin_stats migration missing');
  const sql = readSql(f);
  assert.match(sql, /security\s+definer/i, 'stats function must be SECURITY DEFINER');
  assert.match(sql, /abadihdar@gmail\.com/, 'stats function must check the owner email');
  assert.match(sql, /auth\.jwt\(\)/, 'owner check must use the verified JWT, not client input');
});
