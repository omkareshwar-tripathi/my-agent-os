'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { makeRepo } = require('./fixtures');
const lib = require('../lib');

const BRICKS = `# BRICKS

## Workstream

### Next up
- [ ] **Brick 2 — Next thing**: do the next thing
- [ ] **Brick 3 — Hardware thing**: deferred until hardware arrives
- [ ] **Brick 4 — Later thing**: after brick 2

### Done
- [x] **Brick 1 — First thing** (2026-07-01): did the thing
`;

const VISION = `# Vision

> **North star:** One calm surface for every project.

## The one-paragraph pitch

A hub that re-orients you in a minute.

## Capabilities

| Capability | One-liner | Platforms | Status |
|---|---|---|---|
| Dashboard | See everything | macOS | 🟡 |

## Open strategic questions

- When to add phone capture?
`;

test('readProgress: first open non-blocked item is Doing; parked items are Blocked', () => {
  const repo = makeRepo({ 'BRICKS.md': BRICKS });
  const p = lib.readProgress(repo);
  assert.equal(p.doing[0].title, 'Brick 2 — Next thing');
  assert.equal(p.blocked[0].title, 'Brick 3 — Hardware thing');
  assert.equal(p.next[0].title, 'Brick 4 — Later thing');
  assert.equal(p.done[0].title, 'Brick 1 — First thing');
});

test('readVision: north star, pitch, capabilities, open questions', () => {
  const repo = makeRepo({ 'vision/README.md': VISION });
  const v = lib.readVision(repo);
  assert.equal(v.northStar, 'One calm surface for every project.');
  assert.equal(v.pitch, 'A hub that re-orients you in a minute.');
  assert.deepEqual(v.capabilities, [
    { name: 'Dashboard', line: 'See everything', platforms: 'macOS', status: '🟡' },
  ]);
  assert.deepEqual(v.openQuestions, ['When to add phone capture?']);
});
