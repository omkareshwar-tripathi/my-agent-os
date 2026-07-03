'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { makeRepo, makeDataRoot } = require('./fixtures');

const ADOPT = path.join(__dirname, '..', 'adopt.js');
const HOOKS = ['session-start-status.sh', 'check-status-updated.sh', 'skill-reminder.sh'];

function runAdopt(repo, dataRoot) {
  return execFileSync(process.execPath, [ADOPT], {
    cwd: repo,
    env: { ...process.env, ATLAS_DATA: dataRoot },
    encoding: 'utf8',
  });
}

test('adopt creates STATUS.md, installs hooks, wires settings, registers the repo', () => {
  const repo = makeRepo({ 'README.md': '# hi\n' });
  const dataRoot = makeDataRoot([]);
  const out = runAdopt(repo, dataRoot);
  assert.match(out, /STATUS\.md created/);

  const status = fs.readFileSync(path.join(repo, 'STATUS.md'), 'utf8');
  assert.match(status, /^# STATUS — /);
  assert.match(status, /## Now/);
  assert.match(status, /## Recently done/);
  assert.match(status, /\d{4}-\d{2}-\d{2}\s+init/); // pre-filled from git log

  for (const h of HOOKS) {
    const p = path.join(repo, '.claude', 'hooks', h);
    assert.ok(fs.existsSync(p), h + ' missing');
    assert.ok(fs.statSync(p).mode & 0o100, h + ' not executable');
  }

  const s = JSON.parse(fs.readFileSync(path.join(repo, '.claude', 'settings.json'), 'utf8'));
  assert.equal(s.hooks.SessionStart.length, 1);
  assert.equal(s.hooks.UserPromptSubmit.length, 1);
  assert.equal(s.hooks.Stop.length, 1);
  assert.match(JSON.stringify(s), /session-start-status\.sh/);

  const reg = JSON.parse(fs.readFileSync(path.join(dataRoot, 'registry.json'), 'utf8'));
  assert.equal(reg.repos.length, 1);
  assert.equal(reg.repos[0].tier, 'product');
  assert.equal(fs.realpathSync(reg.repos[0].path), fs.realpathSync(repo));
});

test('adopt is idempotent and merges with existing settings without clobbering', () => {
  const repo = makeRepo({
    '.claude/settings.json': JSON.stringify({
      enabledPlugins: { 'ponytail@ponytail': true },
      hooks: { Stop: [{ hooks: [{ type: 'command', command: 'echo pre-existing' }] }] },
    }, null, 2),
  });
  const dataRoot = makeDataRoot([]);
  runAdopt(repo, dataRoot);

  // user customizes STATUS.md; a second run must not touch it
  fs.writeFileSync(path.join(repo, 'STATUS.md'), '# STATUS — custom\n');
  const settingsAfterFirst = fs.readFileSync(path.join(repo, '.claude', 'settings.json'), 'utf8');
  runAdopt(repo, dataRoot);

  assert.equal(fs.readFileSync(path.join(repo, 'STATUS.md'), 'utf8'), '# STATUS — custom\n');
  assert.equal(fs.readFileSync(path.join(repo, '.claude', 'settings.json'), 'utf8'), settingsAfterFirst);

  const s = JSON.parse(settingsAfterFirst);
  assert.equal(s.enabledPlugins['ponytail@ponytail'], true); // preserved
  assert.equal(s.hooks.Stop.length, 2); // pre-existing echo + our 1

  const reg = JSON.parse(fs.readFileSync(path.join(dataRoot, 'registry.json'), 'utf8'));
  assert.equal(reg.repos.length, 1); // no duplicate registration
});

test('adopt surveys pre-existing Claude assets so they can be folded in', () => {
  const repo = makeRepo({
    'CLAUDE.md': '# rules\n',
    '.claude/skills/legacy-skill/SKILL.md': '---\nname: legacy-skill\n---\n',
    '.claude/commands/deploy.md': '# deploy\n',
    '.claude/hooks/custom-thing.sh': '#!/bin/bash\n',
  });
  const dataRoot = makeDataRoot([]);
  const out = runAdopt(repo, dataRoot);
  assert.match(out, /Also found in this repo/);
  assert.match(out, /CLAUDE\.md/);
  assert.match(out, /legacy-skill/);
  assert.match(out, /deploy/);
  assert.match(out, /custom-thing\.sh/); // non-standard hook, flagged not clobbered
});

test('adopt refuses to run outside a git repo', () => {
  const dir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'atlas-nongit-'));
  const dataRoot = makeDataRoot([]);
  assert.throws(() => runAdopt(dir, dataRoot), /not a git repo/i);
});

test('adopt run from a subdirectory installs at the repo ROOT', () => {
  const repo = makeRepo({ 'src/deep/file.txt': 'x\n' });
  const dataRoot = makeDataRoot([]);
  runAdopt(path.join(repo, 'src', 'deep'), dataRoot);
  assert.ok(fs.existsSync(path.join(repo, 'STATUS.md')), 'STATUS.md at root');
  assert.ok(fs.existsSync(path.join(repo, '.claude', 'settings.json')), 'settings at root');
  assert.equal(fs.existsSync(path.join(repo, 'src', 'deep', 'STATUS.md')), false, 'nothing in subdir');
  const reg = JSON.parse(fs.readFileSync(path.join(dataRoot, 'registry.json'), 'utf8'));
  assert.equal(fs.realpathSync(require('../lib').expandHome(reg.repos[0].path)), fs.realpathSync(repo));
});

test('adopt ABORTS on an unparseable settings.json instead of destroying it', () => {
  const broken = '{ "permissions": { "allow": ["Bash"] }, }'; // trailing comma
  const repo = makeRepo({ '.claude/settings.json': broken });
  const dataRoot = makeDataRoot([]);
  assert.throws(() => runAdopt(repo, dataRoot), /settings\.json/i);
  assert.equal(fs.readFileSync(path.join(repo, '.claude', 'settings.json'), 'utf8'), broken, 'file untouched');
  assert.equal(fs.existsSync(path.join(repo, 'STATUS.md')), false, 'aborted before mutating anything');
});

test('adopt survives a repo with zero commits', () => {
  const dir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'atlas-empty-'));
  require('node:child_process').execSync('git init -q', { cwd: dir });
  const dataRoot = makeDataRoot([]);
  const out = runAdopt(dir, dataRoot);
  assert.match(out, /STATUS\.md created/);
  assert.match(fs.readFileSync(path.join(dir, 'STATUS.md'), 'utf8'), /no commits yet/);
});

test('adopt refuses a slug collision with a DIFFERENT repo instead of silently skipping', () => {
  const repoA = makeRepo({});
  const repoB = makeRepo({});
  const dataRoot = makeDataRoot([]);
  runAdopt(repoA, dataRoot);
  // second repo whose basename slugs to the same id as an existing entry
  const reg = JSON.parse(fs.readFileSync(path.join(dataRoot, 'registry.json'), 'utf8'));
  reg.repos[0].id = path.basename(repoB).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  fs.writeFileSync(path.join(dataRoot, 'registry.json'), JSON.stringify(reg, null, 2));
  assert.throws(() => runAdopt(repoB, dataRoot), /id.*taken|collision/i);
});
