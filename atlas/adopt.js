'use strict';
// Agent-OS adopt — one command connects any repo to the system.
// Run from inside the target repo:  node <my-agent-os>/atlas/adopt.js
//
// Does four things, all idempotent:
//   1. STATUS.md at the repo root (created only if missing, pre-filled from git)
//   2. The four standard hooks copied into .claude/hooks/
//   3. Hook wiring merged into .claude/settings.json (existing settings preserved)
//   4. The repo registered in the private atlas-data registry (dashboard pickup)
//
// Zero dependencies — Node built-ins only.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execSync } = require('node:child_process');
const lib = require('./lib');

const HOOKS_SRC = path.join(__dirname, 'adopt', 'hooks');
const HOOK_WIRING = {
  SessionStart: ['session-start-status.sh'],
  UserPromptSubmit: ['skill-reminder.sh'],
  Stop: ['check-status-updated.sh', 'run-simplify-on-stop.sh'],
};

const repo = process.cwd();
try {
  execSync('git rev-parse --is-inside-work-tree', { cwd: repo, stdio: 'ignore' });
} catch {
  console.error('adopt: ' + repo + ' is not a git repo — run this from inside the repo you want to connect.');
  process.exit(1);
}

const name = path.basename(repo);
console.log('Agent-OS adopt — ' + name);

// 1. STATUS.md (never overwrite — it's the user's file after creation)
const statusPath = path.join(repo, 'STATUS.md');
if (fs.existsSync(statusPath)) {
  console.log('  · STATUS.md already exists — left untouched');
} else {
  const recent = execSync("git log -3 --format='%cs  %s'", { cwd: repo, encoding: 'utf8' })
    .trim().split('\n').map((l) => '- ' + l).join('\n');
  fs.writeFileSync(statusPath, `# STATUS — ${name}                                   updated ${lib.today()}

## What this is
_One or two sentences: what this project is, and the north star. (fill me in)_

## Now
_What's actively being worked on. (fill me in)_

## Next
- _top thing_
- _second thing_

## Recently done
${recent}

## How we work here
Claude reads this file at session start and keeps it updated at session end.
Project rules live in CLAUDE.md (if present). Bump the date above on every edit.
`);
  console.log('  ✓ STATUS.md created (pre-filled from git — edit Now/Next, takes 2 min)');
}

// 2. Hooks
const hooksDir = path.join(repo, '.claude', 'hooks');
fs.mkdirSync(hooksDir, { recursive: true });
for (const h of fs.readdirSync(HOOKS_SRC)) {
  fs.copyFileSync(path.join(HOOKS_SRC, h), path.join(hooksDir, h));
  fs.chmodSync(path.join(hooksDir, h), 0o755);
}
console.log('  ✓ 4 standard hooks installed in .claude/hooks/');

// 3. Settings merge (preserve everything already there; add only missing wiring)
const settingsPath = path.join(repo, '.claude', 'settings.json');
let settings = {};
try {
  settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
} catch { /* no settings yet */ }
settings.hooks = settings.hooks || {};
let wired = 0;
for (const [event, scripts] of Object.entries(HOOK_WIRING)) {
  settings.hooks[event] = settings.hooks[event] || [];
  for (const script of scripts) {
    if (JSON.stringify(settings.hooks[event]).includes(script)) continue;
    settings.hooks[event].push({
      hooks: [{ type: 'command', command: 'bash ${CLAUDE_PROJECT_DIR}/.claude/hooks/' + script }],
    });
    wired++;
  }
}
if (wired > 0) fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
console.log('  ✓ .claude/settings.json — ' + (wired > 0 ? wired + ' hook(s) wired' : 'already wired'));

// 4. Registry (private atlas-data — the dashboard picks it up on next load)
const regPath = path.join(lib.dataRoot(), 'registry.json');
let reg = { repos: [] };
try {
  reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));
} catch { /* fresh data root */ }
const home = os.homedir();
const portablePath = repo.startsWith(home) ? '~' + repo.slice(home.length) : repo;
const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
if (reg.repos.some((r) => lib.expandHome(r.path) === repo || r.id === id)) {
  console.log('  · already registered in atlas-data');
} else {
  reg.repos.push({ id, name, path: portablePath, tier: 'product' });
  fs.mkdirSync(path.dirname(regPath), { recursive: true });
  fs.writeFileSync(regPath, JSON.stringify(reg, null, 2) + '\n');
  console.log('  ✓ registered in atlas-data (appears on your dashboard)');
}

// 5. Survey — recognize what this repo already has beyond the standard bundle,
// so the user (or a Claude session) can decide to fold it into the setup.
const STANDARD_HOOKS = new Set(Object.values(HOOK_WIRING).flat());
const setup = lib.readClaudeSetup(repo);
const extraHooks = fs.readdirSync(hooksDir).filter((h) => !STANDARD_HOOKS.has(h));
const found = [];
if (setup.docs.length) found.push('docs: ' + setup.docs.join(', '));
if (setup.skills.length) found.push('skills: ' + setup.skills.join(', '));
if (setup.commands.length) found.push('commands: /' + setup.commands.join(', /'));
if (extraHooks.length) found.push('non-standard hooks (kept as-is): ' + extraHooks.join(', '));
if (setup.plugins.length) found.push('plugins enabled here: ' + setup.plugins.join(', '));
for (const f of ['BRICKS.md', 'vision/README.md', 'docs/plans']) {
  if (fs.existsSync(path.join(repo, f))) found.push('project docs: ' + f);
}
if (found.length) {
  console.log('\nAlso found in this repo (already working — review whether any should join the standard setup):');
  for (const f of found) console.log('  • ' + f);
}

console.log('\nDone. Open STATUS.md and fill in the two placeholder sections.');
