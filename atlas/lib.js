'use strict';
// Atlas hub — shared library. Adapters generalized from SpeakType's .atlas/sync.js,
// parameterized by repoRoot so one hub serves every registered repo.
// Zero dependencies — Node built-ins only (Node 18+).

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execSync } = require('node:child_process');

function dataRoot() {
  return process.env.ATLAS_DATA || path.join(os.homedir(), 'atlas-data');
}
function expandHome(p) {
  return p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
}
function today() {
  return new Date().toISOString().slice(0, 10);
}
function git(repoRoot, args) {
  return execSync('git ' + args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}
function isGitRepo(p) {
  try {
    git(p, 'rev-parse --is-inside-work-tree');
    return true;
  } catch {
    return false;
  }
}

function loadRegistry() {
  const j = JSON.parse(fs.readFileSync(path.join(dataRoot(), 'registry.json'), 'utf8'));
  return j.repos.map((r) => ({ ...r, path: expandHome(r.path) }));
}

// --- adapters (per-repo readers) ---

function readGit(repoRoot) {
  const iso = git(repoRoot, 'log -1 --format=%cI');
  const commitDay = iso.slice(0, 10);
  const daysAway = Math.round((Date.parse(today()) - Date.parse(commitDay)) / 86400000);
  return {
    branch: git(repoRoot, 'rev-parse --abbrev-ref HEAD'),
    lastCommitISO: iso,
    lastCommitDate: commitDay,
    lastCommitSubject: git(repoRoot, 'log -1 --format=%s'),
    lastCommitAuthor: git(repoRoot, 'log -1 --format=%an'),
    cleanTree: git(repoRoot, 'status --porcelain') === '',
    daysAway,
    generatedAt: today(),
  };
}

// --- sync driver ---

function writeLayer(cacheDir, layer, payload) {
  fs.writeFileSync(path.join(cacheDir, layer + '.json'), JSON.stringify(payload, null, 2) + '\n');
}

function syncAll() {
  const repos = loadRegistry();
  const out = [];
  for (const r of repos) {
    const present = fs.existsSync(r.path) && isGitRepo(r.path);
    if (present) {
      const cacheDir = path.join(dataRoot(), 'cache', r.id);
      fs.mkdirSync(cacheDir, { recursive: true });
      writeLayer(cacheDir, 'git', readGit(r.path));
    }
    out.push({ ...r, present });
  }
  return out;
}

module.exports = { dataRoot, expandHome, today, loadRegistry, readGit, syncAll };
