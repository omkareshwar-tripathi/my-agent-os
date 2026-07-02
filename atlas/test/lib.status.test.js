'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { makeRepo, makeDataRoot } = require('./fixtures');
const lib = require('../lib');

const STATUS = `# STATUS — Thread                                   updated 2026-07-02

## What this is
Meeting-intelligence app for Enterprise PMO teams: meetings in, Spine out.

## Now
v0 polish: Curate board — mutations surface errors.

## Next
- Dogfood a 3-meeting project
- Demo to one real PMO user

## Recently done
- 2026-06-26  Curate board shipped

## How we work here
Claude reads this at session start.
`;

const PLACEHOLDER_STATUS = `# STATUS — Fresh                                   updated 2026-07-02

## What this is
_One or two sentences: what this project is, and the north star. (fill me in)_

## Now
_What's actively being worked on. (fill me in)_

## Next
- _top thing_
`;

test('readStatus parses updated date, pitch, now, next, and recent', () => {
  const repo = makeRepo({ 'STATUS.md': STATUS });
  const s = lib.readStatus(repo);
  assert.equal(s.updated, '2026-07-02');
  assert.equal(s.pitch, 'Meeting-intelligence app for Enterprise PMO teams: meetings in, Spine out.');
  assert.equal(s.now, 'v0 polish: Curate board — mutations surface errors.');
  assert.deepEqual(s.next, ['Dogfood a 3-meeting project', 'Demo to one real PMO user']);
  assert.deepEqual(s.recent, ['2026-06-26 Curate board shipped']);
});

test('readClaudeSetup lists enabled plugins and hook scripts by event', () => {
  const repo = makeRepo({
    '.claude/settings.json': JSON.stringify({
      enabledPlugins: { 'ponytail@ponytail': true, 'off@x': false },
      hooks: {
        SessionStart: [{ hooks: [{ type: 'command', command: 'bash ${CLAUDE_PROJECT_DIR}/.claude/hooks/session-start-status.sh' }] }],
        Stop: [
          { hooks: [{ type: 'command', command: 'bash ${CLAUDE_PROJECT_DIR}/.claude/hooks/check-status-updated.sh' }] },
          { hooks: [{ type: 'command', command: 'bash ${CLAUDE_PROJECT_DIR}/.claude/hooks/run-simplify-on-stop.sh' }] },
        ],
      },
    }),
  });
  const c = lib.readClaudeSetup(repo);
  assert.deepEqual(c.plugins, ['ponytail@ponytail']);
  assert.deepEqual(c.hooks.SessionStart, ['session-start-status.sh']);
  assert.deepEqual(c.hooks.Stop, ['check-status-updated.sh', 'run-simplify-on-stop.sh']);
});

test('readStatus treats unfilled placeholders as empty', () => {
  const repo = makeRepo({ 'STATUS.md': PLACEHOLDER_STATUS });
  const s = lib.readStatus(repo);
  assert.equal(s.pitch, '');
  assert.equal(s.now, '');
  assert.deepEqual(s.next, []);
});

test('syncAll writes status.json + claude.json and state() exposes both', () => {
  const repo = makeRepo({
    'STATUS.md': STATUS,
    '.claude/settings.json': JSON.stringify({ enabledPlugins: { 'ponytail@ponytail': true } }),
  });
  const dataRoot = makeDataRoot([{ id: 'one', name: 'One', path: repo, tier: 'product' }]);
  const s = lib.state();
  assert.ok(fs.existsSync(path.join(dataRoot, 'cache/one/status.json')));
  assert.ok(fs.existsSync(path.join(dataRoot, 'cache/one/claude.json')));
  assert.equal(s.repos[0].status.now, 'v0 polish: Curate board — mutations surface errors.');
  assert.deepEqual(s.repos[0].claude.plugins, ['ponytail@ponytail']);
});
