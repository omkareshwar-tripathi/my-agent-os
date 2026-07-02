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
      if (fs.existsSync(path.join(r.path, 'BRICKS.md'))) writeLayer(cacheDir, 'progress', readProgress(r.path));
      if (fs.existsSync(path.join(r.path, 'vision/README.md'))) writeLayer(cacheDir, 'vision', readVision(r.path));
    }
    out.push({ ...r, present });
  }
  return out;
}

// --- markdown helpers (ported from SpeakType .atlas/sync.js:45-92) ---

function truncate(s, n) {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t;
}
function stripInline(s) {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function sectionBody(lines, headingRe) {
  const start = lines.findIndex((l) => headingRe.test(l));
  if (start < 0) return [];
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{1,6}\s/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out;
}
function parseTable(lines) {
  const rows = [];
  for (const l of lines) {
    if (!/^\s*\|.*\|\s*$/.test(l)) continue;
    if (/^\s*\|[\s:|-]+\|\s*$/.test(l)) continue;
    rows.push(l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()));
  }
  return rows;
}

// --- progress (BRICKS.md) — ported from SpeakType bricksAdapter, minus branch markers ---

const BLOCKED_RE = /\b(blocked|deferred|gated|hardware|awaiting|parked|pending a human)\b/i;

function readProgress(repoRoot) {
  const lines = fs.readFileSync(path.join(repoRoot, 'BRICKS.md'), 'utf8').split('\n');
  let section = '';
  const items = [];
  for (const line of lines) {
    const hm = line.match(/^(#{2,6})\s+(.*)$/);
    if (hm) {
      section = hm[2].replace(/[*_`]/g, '').trim();
      continue;
    }
    const m = line.match(/^\s*-\s*\[([ xX])\]\s+(.*)$/);
    if (!m) continue;
    const body = m[2].trim();
    const bold = body.match(/\*\*(.+?)\*\*/);
    items.push({
      checked: m[1].toLowerCase() === 'x',
      title: bold ? bold[1].trim() : truncate(body, 80),
      detail: truncate(body.replace(/\*\*/g, ''), 240),
      section,
    });
  }
  const done = [];
  const next = [];
  const blocked = [];
  let doing = null;
  for (const it of items) {
    if (it.checked) done.push(it);
    else if (BLOCKED_RE.test(it.title) || BLOCKED_RE.test(it.detail)) blocked.push(it);
    else if (!doing) doing = it;
    else next.push(it);
  }
  return { doing: doing ? [doing] : [], next, blocked, done: done.slice(0, 8), generatedAt: today() };
}

// --- vision (vision/README.md) — ported from SpeakType visionAdapter, minus legend ---

const CAPS_HEADING_RE = /^##\s+(capabilities\b|what's inside\b)/i;

function readVision(repoRoot) {
  const lines = fs.readFileSync(path.join(repoRoot, 'vision/README.md'), 'utf8').split('\n');
  let northStar = '';
  const nsIdx = lines.findIndex((l) => /\*\*North star:\*\*/.test(l));
  if (nsIdx >= 0) {
    const buf = [];
    for (let i = nsIdx; i < lines.length; i++) {
      if (!/^\s*>/.test(lines[i])) break;
      buf.push(lines[i].replace(/^\s*>\s?/, ''));
    }
    northStar = stripInline(buf.join(' ')).replace(/^North star:\s*/i, '');
  }
  const pitch = stripInline(sectionBody(lines, /^##\s+The one-paragraph pitch/).join(' '));
  const capabilities = parseTable(sectionBody(lines, CAPS_HEADING_RE))
    .filter((r) => r.length >= 4 && !/^Capability$/i.test(r[0]))
    .map((r) => ({ name: stripInline(r[0]), line: stripInline(r[1]), platforms: stripInline(r[2]), status: r[3].trim() }));
  const openQuestions = sectionBody(lines, /^##\s+Open strategic questions/)
    .filter((l) => /^\s*-\s+/.test(l))
    .map((l) => stripInline(l.replace(/^\s*-\s+/, '')));
  return { northStar, pitch, capabilities, openQuestions, generatedAt: today() };
}

// --- aggregate view for the dashboard ---

function readCacheLayer(repoId, layer) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dataRoot(), 'cache', repoId, layer + '.json'), 'utf8'));
  } catch {
    return null;
  }
}

function state() {
  const repos = syncAll().map((r) => {
    const g = readCacheLayer(r.id, 'git');
    const activity = !g ? 'unknown' : g.daysAway < 14 ? 'active' : g.daysAway < 90 ? 'parked' : 'dormant';
    return { ...r, activity, git: g, progress: readCacheLayer(r.id, 'progress'), vision: readCacheLayer(r.id, 'vision') };
  });
  return { generatedAt: today(), repos };
}

module.exports = { dataRoot, expandHome, today, loadRegistry, readGit, readProgress, readVision, syncAll, state };
