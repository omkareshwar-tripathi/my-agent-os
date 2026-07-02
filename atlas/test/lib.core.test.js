'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const { tmp, makeRepo, makeDataRoot } = require('./fixtures');
const lib = require('../lib');

test('gather reads git for present repos and flags missing ones', () => {
  const repo = makeRepo({ 'README.md': '# hi\n' });
  makeDataRoot([
    { id: 'one', name: 'One', path: repo, tier: 'product' },
    { id: 'gone', name: 'Gone', path: '/nope/nowhere', tier: 'product' },
  ]);
  const repos = lib.gather();
  const one = repos.find((r) => r.id === 'one');
  assert.equal(one.present, true);
  assert.equal(one.git.lastCommitSubject, 'init');
  assert.equal(one.git.daysAway, 0);
  assert.equal(one.git.cleanTree, true);
  assert.equal(one.activity, 'active');
  const gone = repos.find((r) => r.id === 'gone');
  assert.equal(gone.present, false);
  assert.equal(gone.git, null);
  assert.equal(gone.activity, 'unknown');
});

test('one broken repo does not take down the others', () => {
  const good = makeRepo({});
  const empty = tmp(); // git repo with ZERO commits — readGit throws
  execSync('git init -q', { cwd: empty });
  makeDataRoot([
    { id: 'bad', name: 'Bad', path: empty, tier: 'product' },
    { id: 'good', name: 'Good', path: good, tier: 'product' },
  ]);
  const repos = lib.gather();
  const bad = repos.find((r) => r.id === 'bad');
  assert.ok(bad.error, 'broken repo carries an error message');
  const ok = repos.find((r) => r.id === 'good');
  assert.equal(ok.error, null);
  assert.equal(ok.git.lastCommitSubject, 'init');
});

test('daysAway never goes negative and today() is the local date', () => {
  const repo = makeRepo({});
  // commit stamped one day ahead in a +05:30 timezone (the audit's repro)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  execSync(
    'git -c user.email=t@t.t -c user.name=t commit -q --allow-empty -m future',
    { cwd: repo, env: { ...process.env, GIT_COMMITTER_DATE: `${tomorrow}T04:00:00+05:30` } });
  makeDataRoot([{ id: 'tz', name: 'Tz', path: repo, tier: 'product' }]);
  const [r] = lib.gather();
  assert.ok(r.git.daysAway >= 0, `daysAway ${r.git.daysAway} must not be negative`);
  // local date, not UTC: matches what `date +%F` produces on this machine
  const local = execSync('date +%F', { encoding: 'utf8' }).trim();
  assert.equal(lib.today(), local);
});

test('loadRegistry expands ~ in paths', () => {
  makeDataRoot([{ id: 'h', name: 'H', path: '~/somewhere', tier: 'product' }]);
  const [r] = lib.loadRegistry();
  assert.equal(r.path.startsWith('/'), true);
  assert.equal(r.path.includes('~'), false);
});
