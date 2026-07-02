'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const { tmp, makeRepo, makeDataRoot } = require('./fixtures');

const DASHBOARD = path.join(__dirname, '..', 'dashboard.js');

test('dashboard.js renders one static page: status, claude setup, and per-repo errors', () => {
  const repo = makeRepo({
    'STATUS.md': `# STATUS — One                                   updated 2026-07-02

## What this is
A thing that does things.

## Now
Polish the doohickey.

## Next
- Ship it
`,
    '.claude/settings.json': JSON.stringify({
      enabledPlugins: { 'ponytail@ponytail': true },
      hooks: { Stop: [{ hooks: [{ type: 'command', command: 'bash ${CLAUDE_PROJECT_DIR}/.claude/hooks/check-status-updated.sh' }] }] },
    }),
  });
  const empty = tmp(); // broken repo: zero commits
  execSync('git init -q', { cwd: empty });
  const dataRoot = makeDataRoot([
    { id: 'one', name: 'One', path: repo, tier: 'product' },
    { id: 'bad', name: 'Bad', path: empty, tier: 'product' },
    { id: 'sat', name: 'Sat', path: '/nope', tier: 'satellite', satelliteOf: 'one' },
  ]);
  const out = path.join(dataRoot, 'dashboard.html');
  execSync(`"${process.execPath}" "${DASHBOARD}" "${out}"`, { env: { ...process.env, ATLAS_DATA: dataRoot } });
  const html = fs.readFileSync(out, 'utf8');
  assert.match(html, /One/);
  assert.match(html, /Polish the doohickey/);
  assert.match(html, /check-status-updated\.sh/);
  assert.match(html, /ponytail@ponytail/);
  // a broken repo shows its error but does NOT blank the page
  assert.match(html, /Bad/);
  assert.match(html, /class="err"/);
  // satellites render too
  assert.match(html, /Sat/);
  // repo content is escaped (no raw script injection from repo files)
  assert.doesNotMatch(html, /<script>alert/);
});
