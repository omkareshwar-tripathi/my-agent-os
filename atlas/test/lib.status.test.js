'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
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

test('readClaudeSetup lists plugins, hooks, skills, commands, and extras', () => {
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
    '.claude/skills/my-skill/SKILL.md': '---\nname: my-skill\n---\n',
    '.claude/commands/ship.md': '# ship\n',
    'CLAUDE.md': '# rules\n',
    'AGENTS.md': '# agents\n',
  });
  const c = lib.readClaudeSetup(repo);
  assert.deepEqual(c.plugins, ['ponytail@ponytail']);
  assert.deepEqual(c.hooks.SessionStart, ['session-start-status.sh']);
  assert.deepEqual(c.hooks.Stop, ['check-status-updated.sh', 'run-simplify-on-stop.sh']);
  assert.deepEqual(c.skills, ['my-skill']);
  assert.deepEqual(c.commands, ['ship']);
  assert.deepEqual(c.docs, ['CLAUDE.md', 'AGENTS.md']);
});

test('readStatus treats unfilled placeholders as empty', () => {
  const repo = makeRepo({ 'STATUS.md': PLACEHOLDER_STATUS });
  const s = lib.readStatus(repo);
  assert.equal(s.pitch, '');
  assert.equal(s.now, '');
  assert.deepEqual(s.next, []);
});

test('gather exposes status and claude layers for a present repo', () => {
  const repo = makeRepo({
    'STATUS.md': STATUS,
    '.claude/settings.json': JSON.stringify({ enabledPlugins: { 'ponytail@ponytail': true } }),
  });
  makeDataRoot([{ id: 'one', name: 'One', path: repo, tier: 'product' }]);
  const [r] = lib.gather();
  assert.equal(r.status.now, 'v0 polish: Curate board — mutations surface errors.');
  assert.deepEqual(r.claude.plugins, ['ponytail@ponytail']);
});

test('readClaudeSetup keeps multi-dot hook script names intact', () => {
  const repo = makeRepo({
    '.claude/settings.json': JSON.stringify({
      hooks: { Stop: [{ hooks: [{ type: 'command', command: 'bash ${CLAUDE_PROJECT_DIR}/.claude/hooks/pre.check.sh' }] }] },
    }),
  });
  const c = lib.readClaudeSetup(repo);
  assert.deepEqual(c.hooks.Stop, ['pre.check.sh']);
});
