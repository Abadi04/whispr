// Loads pure (DOM-free) helpers straight out of app.js so tests exercise the
// REAL shipped code, not a copy. app.js touches window/document at the top
// level, so we extract only the named helper definitions and eval them in an
// isolated VM context.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const src = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

function grab(re, label) {
  const m = src.match(re);
  if (!m) throw new Error(`Could not extract ${label} from app.js — did it move/rename?`);
  return m[0];
}

const pieces = [
  grab(/^const MAX_MESSAGE_LEN = .*$/m, 'MAX_MESSAGE_LEN'),
  grab(/^const USERNAME_RE = .*$/m, 'USERNAME_RE'),
  grab(/^function escHtml\([\s\S]*?^}/m, 'escHtml'),
  grab(/^function validateUsername\([\s\S]*?^}/m, 'validateUsername'),
  grab(/^function validateMessage\([\s\S]*?^}/m, 'validateMessage'),
];

const sandbox = {};
vm.runInNewContext(
  pieces.join('\n\n') +
    '\n;this.escHtml = escHtml; this.validateUsername = validateUsername;' +
    'this.validateMessage = validateMessage; this.MAX_MESSAGE_LEN = MAX_MESSAGE_LEN;',
  sandbox
);

module.exports = sandbox;
