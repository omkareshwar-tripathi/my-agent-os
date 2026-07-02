'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execSync } = require('node:child_process');

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-test-'));
}

// A throwaway git repo with one commit; `files` maps relative path → content.
function makeRepo(files = {}) {
  const dir = tmp();
  for (const [rel, content] of Object.entries(files)) {
    const p = path.join(dir, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
  const run = (cmd) => execSync(cmd, { cwd: dir, stdio: 'ignore' });
  run('git init -q');
  run('git add -A');
  run('git -c user.email=t@t.t -c user.name=t commit -q --allow-empty -m "init"');
  return dir;
}

// A data root with a registry pointing at the given repos; sets ATLAS_DATA.
function makeDataRoot(repos) {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'registry.json'), JSON.stringify({ repos }, null, 2) + '\n');
  process.env.ATLAS_DATA = dir;
  return dir;
}

module.exports = { tmp, makeRepo, makeDataRoot };
