'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { makeRepo, makeDataRoot } = require('./fixtures');
const lib = require('../lib');

test('syncAll writes git.json for present repos and flags missing ones', () => {
  const repo = makeRepo({ 'README.md': '# hi\n' });
  const dataRoot = makeDataRoot([
    { id: 'one', name: 'One', path: repo, tier: 'product' },
    { id: 'gone', name: 'Gone', path: '/nope/nowhere', tier: 'product' },
  ]);
  const result = lib.syncAll();
  assert.equal(result.find((r) => r.id === 'one').present, true);
  assert.equal(result.find((r) => r.id === 'gone').present, false);
  const g = JSON.parse(fs.readFileSync(path.join(dataRoot, 'cache/one/git.json'), 'utf8'));
  assert.equal(g.lastCommitSubject, 'init');
  assert.equal(g.daysAway, 0);
  assert.equal(g.cleanTree, true);
  assert.ok(g.branch.length > 0);
  assert.equal(fs.existsSync(path.join(dataRoot, 'cache/gone')), false);
});

test('state() recomputes activity from lastCommitDate even when cached daysAway is stale', () => {
  const dataRoot = makeDataRoot([{ id: 'stale', name: 'Stale', path: '/nope/gone', tier: 'product' }]);
  const cacheDir = path.join(dataRoot, 'cache', 'stale');
  fs.mkdirSync(cacheDir, { recursive: true });
  const oldDate = new Date(Date.now() - 100 * 86400000).toISOString().slice(0, 10);
  fs.writeFileSync(path.join(cacheDir, 'git.json'), JSON.stringify({
    branch: 'main',
    lastCommitISO: oldDate + 'T00:00:00Z',
    lastCommitDate: oldDate,
    lastCommitSubject: 'x',
    lastCommitAuthor: 'x',
    cleanTree: true,
    daysAway: 0,
    generatedAt: oldDate,
  }));
  const s = lib.state();
  const r = s.repos.find((x) => x.id === 'stale');
  assert.equal(r.activity, 'dormant');
  assert.equal(r.git.daysAway, 100);
});

test('loadRegistry expands ~ in paths', () => {
  makeDataRoot([{ id: 'h', name: 'H', path: '~/somewhere', tier: 'product' }]);
  const [r] = lib.loadRegistry();
  assert.equal(r.path.startsWith('/'), true);
  assert.equal(r.path.includes('~'), false);
});
