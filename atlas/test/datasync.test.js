'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const { tmp, makeDataRoot } = require('./fixtures');
const lib = require('../lib');

test('dataSync push commits dirty state to the remote; clean push is a no-op; no-remote is safe', () => {
  const remote = tmp();
  execSync(`git init -q --bare "${remote}"`);
  const dataRoot = makeDataRoot([]);
  const run = (cmd) => execSync(cmd, { cwd: dataRoot, stdio: 'ignore' });
  run('git init -q');
  run('git -c user.email=t@t.t -c user.name=t commit -q --allow-empty -m "init"');
  run(`git remote add origin "${remote}"`);
  run('git push -qu origin HEAD');

  fs.writeFileSync(path.join(dataRoot, 'thoughts.json'), '{"thoughts":[]}\n');
  assert.equal(lib.dataSync('push'), true);
  const remoteLog = execSync(`git --git-dir="${remote}" log --format=%s`, { encoding: 'utf8' });
  assert.match(remoteLog, /atlas-data: sync/);

  assert.equal(lib.dataSync('push'), true); // clean tree → no new commit, still ok
  assert.equal(lib.dataSync('pull'), true);

  const orphan = makeDataRoot([]); // fresh dir, not even a git repo
  assert.equal(fs.existsSync(path.join(orphan, 'registry.json')), true);
  assert.equal(lib.dataSync('push'), false); // never throws
});
