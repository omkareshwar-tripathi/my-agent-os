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
  try {
    const res = await fetch(`http://127.0.0.1:${server.address().port}/api/state`);
    assert.equal(res.status, 200);
    const s = await res.json();
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
    server.close();
  }
});
