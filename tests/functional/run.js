// Functional/integration test: loads the REAL index.html + app.js in jsdom with
// an in-memory mock of the Supabase client, then drives actual user flows and
// asserts on what the app renders. This executes the shipped code — no stubs of
// app logic, no assumptions.
//
// Run: node tests/functional/run.js
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');

// jsdom is an optional dev-only dependency (the app itself ships no npm deps).
// Skip cleanly if it isn't installed. Provide its path via JSDOM_PATH or install
// it anywhere on NODE_PATH.
let JSDOM, VirtualConsole;
try {
  ({ JSDOM, VirtualConsole } = require(process.env.JSDOM_PATH || 'jsdom'));
} catch {
  console.log('SKIP: jsdom not installed — functional browser tests skipped.');
  console.log('      To run: npm i jsdom (in a temp dir) then JSDOM_PATH=<path> node tests/functional/run.js');
  process.exit(0);
}

const ROOT = path.join(__dirname, '..', '..');
let passed = 0;
const ok = (name) => { console.log('ok -', name); passed++; };

// ---- In-memory mock of the Supabase client (auth + from() query builder) ----
function makeSupabaseMock() {
  const db = { messages: [], profiles: [], blocks: [] };
  let session = null; // { id, email }
  const uid = () => session?.id || null;

  function from(table) {
    const rows = db[table];
    const q = { _filters: [], _notNull: null, _order: null };
    const applyFilters = () => rows.filter(r =>
      q._filters.every(([c, v]) => r[c] === v) &&
      (q._notNull ? r[q._notNull] != null : true));
    const builder = {
      select(_cols, opts) {
        q._opts = opts || {};
        return builder;
      },
      eq(c, v) { q._filters.push([c, v]); return builder; },
      not(c, _op, _v) { q._notNull = c; return builder; },
      order() { return builder; },
      maybeSingle() {
        const r = applyFilters()[0] || null;
        return Promise.resolve({ data: r, error: null });
      },
      then(resolve) {
        // terminal: SELECT (with optional count) or used after insert/update/delete
        let data = applyFilters();
        if (q._opts && q._opts.count === 'exact') {
          return resolve({ data: null, count: data.length, error: null });
        }
        return resolve({ data, error: null });
      },
      insert(payload) {
        const arr = Array.isArray(payload) ? payload : [payload];
        for (const p of arr) {
          // emulate RLS insert check: sender_id null or === uid
          if (p.sender_id && p.sender_id !== uid()) {
            return Promise.resolve({ error: { message: 'rls: sender spoof' } });
          }
          rows.push({ id: 'm' + (rows.length + 1), is_read: false, reply: null,
            created_at: new Date().toISOString(), ...p });
        }
        return Promise.resolve({ error: null });
      },
      update(patch) {
        return {
          eq(c, v) { q._filters.push([c, v]); return this; },
          then(resolve) {
            for (const r of applyFilters()) Object.assign(r, patch);
            return resolve({ error: null });
          },
        };
      },
      delete() {
        return {
          eq(c, v) { q._filters.push([c, v]); return this; },
          match(obj) { for (const k in obj) q._filters.push([k, obj[k]]); return this; },
          then(resolve) {
            const keep = rows.filter(r => !q._filters.every(([c, v]) => r[c] === v));
            rows.length = 0; rows.push(...keep);
            return resolve({ error: null });
          },
        };
      },
    };
    return builder;
  }

  const client = {
    _db: db,
    _login(u) { session = u; },
    auth: {
      getUser: async () => ({ data: { user: session ? { id: session.id, email: session.email } : null } }),
      signInWithPassword: async ({ email }) => {
        const p = db.profiles.find(x => x.email === email);
        if (!p) return { data: null, error: { message: 'invalid' } };
        session = { id: p.id, email: p.email };
        return { data: { user: { id: p.id, email: p.email } }, error: null };
      },
      signUp: async ({ email, options }) => {
        const id = 'u' + (db.profiles.length + 1);
        db.profiles.push({ id, email, full_name: options?.data?.full_name, avatar_url: null });
        session = { id, email };
        return { data: { user: { id, email } }, error: null };
      },
      signOut: async () => { session = null; return {}; },
    },
    from,
    rpc: async (fn) => {
      if (fn === 'get_admin_stats') {
        if (session?.email !== 'abadihdar@gmail.com') return { data: null, error: { message: 'forbidden' } };
        return { data: { total_users: db.profiles.length, total_messages: db.messages.length,
          messages_last_7d: db.messages.length, active_users_7d: 1,
          replied_messages: db.messages.filter(m => m.reply).length }, error: null };
      }
      return { data: null, error: { message: 'unknown rpc' } };
    },
  };
  return client;
}

async function boot() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
    // strip the real Supabase CDN script; we inject a mock instead
    .replace(/<script src="https:\/\/cdn[^>]*><\/script>/, '')
    .replace('<script src="app.js"></script>', '');
  const vc = new VirtualConsole();
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true,
    url: 'https://abadi04.github.io/whispr/', virtualConsole: vc });
  const { window } = dom;
  const mock = makeSupabaseMock();
  window.supabase = { createClient: () => mock };
  // jsdom lacks these; app.js touches them
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
  window.cancelAnimationFrame = () => {};
  // jsdom lacks the Web Animations API used by celebrateSend()
  window.Element.prototype.animate = function () {
    const o = {}; Object.defineProperty(o, 'onfinish', { set(fn) { setTimeout(fn, 0); } }); return o;
  };
  if (!window.navigator.clipboard) {
    Object.defineProperty(window.navigator, 'clipboard', { value: { writeText: async () => {} }, configurable: true });
  }
  // app.js runs via window.eval, so bare globals (document, localStorage,
  // location, navigator, requestAnimationFrame) resolve to the window's — no
  // global assignment needed.
  // evaluate the real app.js in the window context. readyState is 'loading',
  // so app.init() runs exactly once via jsdom's natural DOMContentLoaded — we
  // must NOT dispatch it ourselves (that would double-init and attach listeners
  // twice). Wait for the app to initialize.
  const appSrc = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  window.eval(appSrc);
  for (let i = 0; i < 50 && !(window.app && window.app.currentRoute); i++) await tick(10);
  return { window, mock };
}

const tick = (ms = 10) => new Promise(r => setTimeout(r, ms));
async function setHash(window, h) {
  window.location.hash = h;
  window.dispatchEvent(new window.Event('hashchange'));
  await tick(40);
}
const root = (w) => w.document.getElementById('app-root').innerHTML;

(async () => {
  const { window, mock } = await boot();
  const app = window.app;
  // mark onboarding done so routing goes straight to pages
  window.localStorage.setItem('whispr_onboarding_done', '1');

  // 1) Home renders
  await setHash(window, '');
  assert.match(root(window), /استقبل رسائل مجهولة/, 'home hero text');
  ok('home view renders');

  // 2) Register creates a profile and lands in inbox
  await setHash(window, 'register');
  assert.ok(window.document.getElementById('register-form'), 'register form present');
  window.document.getElementById('reg-username').value = 'Abdullah';
  window.document.getElementById('reg-email').value = 'a@test.com';
  window.document.getElementById('reg-password').value = 'secret1';
  window.document.getElementById('register-form').dispatchEvent(new window.Event('submit'));
  await tick(60);
  assert.equal(mock._db.profiles.length, 1, 'profile created');
  ok('register flow creates profile');

  // 3) Password is NOT persisted to localStorage
  const lsUsers = window.localStorage.getItem('bawh_users') || '';
  assert.ok(!/secret1/.test(lsUsers), 'password must not be stored in localStorage');
  ok('password not leaked to localStorage');

  // 4) Anonymous visitor sends a message via the public profile
  await app.logout(); await tick(20);
  await setHash(window, 'u/Abdullah');
  assert.ok(window.document.getElementById('send-msg-form'), 'send form present on profile');
  window.document.getElementById('msg-content').value = 'رسالة مجهولة للاختبار';
  window.document.getElementById('send-msg-form').dispatchEvent(new window.Event('submit'));
  await tick(60);
  assert.equal(mock._db.messages.length, 1, 'message inserted to backend');
  assert.equal(mock._db.messages[0].sender_id, undefined, 'anonymous send has no sender_id');
  ok('anonymous message send works');

  // 5) Receiver logs in and sees the message in the inbox
  await setHash(window, 'login');
  window.document.getElementById('login-email').value = 'a@test.com';
  window.document.getElementById('login-password').value = 'secret1';
  window.document.getElementById('login-form').dispatchEvent(new window.Event('submit'));
  await tick(80);
  await setHash(window, 'inbox');
  assert.match(root(window), /رسالة مجهولة للاختبار/, 'message visible in inbox');
  ok('inbox displays received message');

  // 6) Reply shows up and the reply form disappears (regression: reply column)
  const msgId = mock._db.messages[0].id;
  await app.submitReply({ preventDefault(){}, target: (() => {
    const f = window.document.createElement('form');
    const ta = window.document.createElement('textarea'); ta.value = 'ردّي العام';
    const btn = window.document.createElement('button'); btn.type = 'submit';
    f.appendChild(ta); f.appendChild(btn); return f; })() }, msgId);
  await tick(60);
  assert.equal(mock._db.messages[0].reply, 'ردّي العام', 'reply saved to backend');
  assert.match(root(window), /ردّي العام/, 'reply rendered in inbox');
  ok('reply flow works and renders');

  // 7) Public profile shows the replied message on the wall
  await app.logout(); await tick(20);
  await setHash(window, 'u/Abdullah');
  assert.match(root(window), /ردّي العام/, 'public replies wall shows reply');
  ok('public replies wall renders replied messages');

  // 8) Non-owner cannot reach analytics
  await setHash(window, 'login');
  window.document.getElementById('login-email').value = 'a@test.com';
  window.document.getElementById('login-password').value = 'secret1';
  window.document.getElementById('login-form').dispatchEvent(new window.Event('submit'));
  await tick(80);
  await setHash(window, 'analytics');
  assert.ok(!/لوحة التحليلات/.test(root(window)), 'non-owner redirected away from analytics');
  ok('analytics gated for non-owner');

  // 9) Theme toggle persists
  const before = window.document.body.getAttribute('data-theme');
  window.document.getElementById('theme-toggle').dispatchEvent(new window.Event('click'));
  await tick(10);
  assert.notEqual(window.document.body.getAttribute('data-theme'), before, 'theme toggles');
  ok('theme toggle works');

  // 10) Unknown route falls back to home (no crash)
  await setHash(window, 'totally-unknown-route');
  assert.match(root(window), /استقبل رسائل مجهولة/, 'unknown route -> home');
  ok('unknown route falls back to home');

  console.log(`\n# functional tests passed: ${passed}/10`);
  process.exit(0);
})().catch(e => { console.error('FUNCTIONAL TEST FAILED:\n', e); process.exit(1); });
