const fs = require('fs');

const trans = fs.readFileSync('core/translations.js', 'utf8');
const defMatches = trans.match(/[a-zA-Z0-9_]+(?=\s*:)/g);
const defs = Array.from(new Set(defMatches));

const files = [
  'soldier/soldier_dashboard.js',
  'soldier/soldier_registration.js',
  'host/host_dashboard.js',
  'host/host_registration.js',
  'core/app.js'
];

let used = [];
for (const file of files) {
  if (fs.existsSync(file)) {
    const code = fs.readFileSync(file, 'utf8');
    const matches = code.matchAll(/t\(['"]([a-zA-Z0-9_]+)['"]\)/g);
    used = used.concat(Array.from(matches).map(m => m[1]));
  }
}

used = Array.from(new Set(used));

const missing = used.filter(k => !defs.includes(k));
console.log('Missing keys in core/translations.js:', missing.join(', '));
