// Security & validation unit tests for Whispr.
// Run with:  node --test   (from the repo root). No npm install required.
const test = require('node:test');
const assert = require('node:assert/strict');
const { escHtml, validateUsername, validateMessage, MAX_MESSAGE_LEN } = require('./load-app');

test('escHtml escapes all HTML-body metacharacters', () => {
  assert.equal(escHtml('<script>alert(1)</script>'),
    '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.equal(escHtml('a & b'), 'a &amp; b');
  assert.equal(escHtml('say "hi"'), 'say &quot;hi&quot;');
});

test('escHtml escapes the single quote (attribute breakout protection)', () => {
  // Regression: the original implementation left ' unescaped, allowing
  // breakout from single-quoted onclick="...('${value}')" attributes.
  const malicious = "');app.logout();//";
  const out = escHtml(malicious);
  assert.ok(!out.includes("'"), 'single quote must be encoded');
  assert.ok(out.includes('&#39;'));
});

test('escHtml escapes backticks', () => {
  assert.ok(!escHtml('a`b').includes('`'));
});

test('escHtml handles null/undefined/empty safely', () => {
  assert.equal(escHtml(null), '');
  assert.equal(escHtml(undefined), '');
  assert.equal(escHtml(''), '');
  assert.equal(escHtml(0), '0'); // 0 must NOT be treated as empty
});

test('escHtml is idempotent-safe and does not double-unescape', () => {
  assert.equal(escHtml('&amp;'), '&amp;amp;');
});

test('validateUsername accepts valid handles', () => {
  for (const u of ['abadi', 'user_01', 'A1', 'a'.repeat(30)]) {
    assert.equal(validateUsername(u), true, `${u} should be valid`);
  }
});

test('validateUsername rejects unsafe / malformed handles', () => {
  for (const u of ['', 'a'.repeat(31), 'has space', 'bad-dash', '<x>',
                   "o'brien", 'emoji😀', null, undefined, 42]) {
    assert.equal(validateUsername(u), false, `${JSON.stringify(u)} should be invalid`);
  }
});

test('validateMessage trims and rejects empty/whitespace', () => {
  assert.equal(validateMessage('   '), null);
  assert.equal(validateMessage(''), null);
  assert.equal(validateMessage('  hello  '), 'hello');
  assert.equal(validateMessage(null), null);
  assert.equal(validateMessage(12345), null);
});

test('validateMessage clamps to MAX_MESSAGE_LEN', () => {
  const long = 'x'.repeat(MAX_MESSAGE_LEN + 500);
  assert.equal(validateMessage(long).length, MAX_MESSAGE_LEN);
});
