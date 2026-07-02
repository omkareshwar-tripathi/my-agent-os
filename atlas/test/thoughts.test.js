'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { makeRepo, makeDataRoot } = require('./fixtures');
const lib = require('../lib');

test('addThought delivers into the target repo THOUGHTS.md', () => {
  const repo = makeRepo({});
  makeDataRoot([{ id: 'one', name: 'One', path: repo, tier: 'product' }]);
  const th = lib.addThought('one', 'auto-pause dictation on calls');
  assert.equal(th.status, 'delivered');
  const md = fs.readFileSync(path.join(repo, 'THOUGHTS.md'), 'utf8');
  assert.match(md, /^# Thoughts inbox/);
  assert.match(md, new RegExp(`- \\[ \\] ${th.date} — auto-pause dictation on calls`));
});

test('thought for an absent repo stays pending, then delivers via syncAll', () => {
  const repo = makeRepo({});
  const dataRoot = makeDataRoot([{ id: 'one', name: 'One', path: '/nope', tier: 'product' }]);
  const th = lib.addThought('one', 'later idea');
  assert.equal(th.status, 'pending');
  // repo appears on this device: fix the registry path, then sync
  fs.writeFileSync(path.join(dataRoot, 'registry.json'),
    JSON.stringify({ repos: [{ id: 'one', name: 'One', path: repo, tier: 'product' }] }, null, 2));
  lib.syncAll();
  assert.match(fs.readFileSync(path.join(repo, 'THOUGHTS.md'), 'utf8'), /later idea/);
  assert.equal(lib.loadThoughts().thoughts[0].status, 'delivered');
});

test('unsorted thoughts never touch a repo and surface in state()', () => {
  makeDataRoot([]);
  lib.addThought('unsorted', 'some day: voice memos');
  const s = lib.state();
  assert.equal(s.unsorted.length, 1);
  assert.equal(s.unsorted[0].text, 'some day: voice memos');
});
