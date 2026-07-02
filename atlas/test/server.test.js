'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { makeRepo, makeDataRoot } = require('./fixtures');

test('/api/state aggregates registry + derived layers', async () => {
  const repo = makeRepo({
    'BRICKS.md': '## W\n- [ ] **B1 — thing**: do it\n',
    'vision/README.md': '> **North star:** Ship.\n',
  });
  makeDataRoot([
    { id: 'one', name: 'One', path: repo, tier: 'product' },
    { id: 'sat', name: 'Sat', path: '/nope', tier: 'satellite', satelliteOf: 'one' },
  ]);
  const { server } = require('../server');
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origLog = console.log; // silence the expected sync warning
  console.log = () => {};
  try {
    const res = await fetch(`http://127.0.0.1:${server.address().port}/api/state`);
    assert.equal(res.status, 200);
    const s = await res.json();
    assert.equal(s.syncOk, false); // fixture dataRoot is not a git repo → pull/push fail
    const one = s.repos.find((r) => r.id === 'one');
    assert.equal(one.present, true);
    assert.equal(one.activity, 'active'); // committed today
    assert.equal(one.progress.doing[0].title, 'B1 — thing');
    assert.equal(one.vision.northStar, 'Ship.');
    const sat = s.repos.find((r) => r.id === 'sat');
    assert.equal(sat.present, false);
    assert.equal(sat.git, null);
    assert.equal(sat.activity, 'unknown');
  } finally {
    console.log = origLog;
    server.close();
  }
});

test('POST /api/thought with unknown repoId → 400', async () => {
  makeDataRoot([{ id: 'one', name: 'One', path: makeRepo({}), tier: 'product' }]);
  const { server } = require('../server');
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    const res = await fetch(`http://127.0.0.1:${server.address().port}/api/thought`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoId: 'nope-not-real', text: 'hello' }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, 'unknown repoId');
  } finally {
    server.close();
  }
});
