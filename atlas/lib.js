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
  deliverPending();
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
      if (fs.existsSync(path.join(r.path, 'STATUS.md'))) writeLayer(cacheDir, 'status', readStatus(r.path));
      if (fs.existsSync(path.join(r.path, '.claude', 'settings.json'))) writeLayer(cacheDir, 'claude', readClaudeSetup(r.path));
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

// --- status (STATUS.md — the one-file overview installed by adopt.js) ---

// Template placeholders are _italic (fill me in)_ lines — treat as empty.
function isPlaceholder(l) {
  const t = l.trim().replace(/^-\s+/, '');
  return t.startsWith('_') && t.endsWith('_');
}

function readStatus(repoRoot) {
  const lines = fs.readFileSync(path.join(repoRoot, 'STATUS.md'), 'utf8').split('\n');
  const um = (lines[0] || '').match(/updated\s+(\d{4}-\d{2}-\d{2})/);
  const section = (re) => stripInline(sectionBody(lines, re).filter((l) => l.trim() && !isPlaceholder(l)).join(' '));
  const bullets = (re) => sectionBody(lines, re)
    .filter((l) => /^\s*-\s+/.test(l) && !isPlaceholder(l))
    .map((l) => stripInline(l.replace(/^\s*-\s+/, '')));
  return {
    updated: um ? um[1] : '',
    pitch: section(/^##\s+What this is\b/),
    now: section(/^##\s+Now\b/),
    next: bullets(/^##\s+Next\b/),
    recent: bullets(/^##\s+Recently done\b/),
    generatedAt: today(),
  };
}

// --- claude setup (.claude/settings.json — what the agent-OS applied here) ---

function listDir(p, filter) {
  try {
    return fs.readdirSync(p).filter(filter).sort();
  } catch {
    return [];
  }
}

function readClaudeSetup(repoRoot) {
  const out = { plugins: [], hooks: {}, skills: [], commands: [], docs: [], generatedAt: today() };
  try {
    const s = JSON.parse(fs.readFileSync(path.join(repoRoot, '.claude', 'settings.json'), 'utf8'));
    out.plugins = Object.keys(s.enabledPlugins || {}).filter((k) => s.enabledPlugins[k]);
    for (const [event, entries] of Object.entries(s.hooks || {})) {
      const scripts = [];
      for (const e of entries) {
        for (const h of e.hooks || []) {
          const m = (h.command || '').match(/([\w-]+\.(?:sh|js|cjs))/);
          scripts.push(m ? m[1] : truncate(h.command || '', 40));
        }
      }
      if (scripts.length) out.hooks[event] = scripts;
    }
  } catch { /* no .claude/settings.json — empty setup */ }
  out.skills = listDir(path.join(repoRoot, '.claude', 'skills'), (d) => safeIsDir(path.join(repoRoot, '.claude', 'skills', d)));
  out.commands = listDir(path.join(repoRoot, '.claude', 'commands'), (f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
  for (const doc of ['CLAUDE.md', 'AGENTS.md']) {
    if (fs.existsSync(path.join(repoRoot, doc))) out.docs.push(doc);
  }
  return out;
}

function safeIsDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
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
    let activity = 'unknown';
    if (g) {
      const days = Math.round((Date.parse(today()) - Date.parse(g.lastCommitDate)) / 86400000);
      activity = days < 14 ? 'active' : days < 90 ? 'parked' : 'dormant';
      g.daysAway = days;
    }
    return { ...r, activity, git: g, progress: readCacheLayer(r.id, 'progress'), vision: readCacheLayer(r.id, 'vision'), status: readCacheLayer(r.id, 'status'), claude: readCacheLayer(r.id, 'claude') };
  });
  const pending = loadThoughts().thoughts.filter((t) => t.status === 'pending');
  for (const r of repos) r.pendingThoughts = pending.filter((t) => t.repoId === r.id).length;
  return { generatedAt: today(), repos, unsorted: pending.filter((t) => t.repoId === 'unsorted') };
}

// --- thought inbox ---

function thoughtsPath() {
  return path.join(dataRoot(), 'thoughts.json');
}
function loadThoughts() {
  try {
    return JSON.parse(fs.readFileSync(thoughtsPath(), 'utf8'));
  } catch {
    return { thoughts: [] };
  }
}
function saveThoughts(t) {
  fs.writeFileSync(thoughtsPath(), JSON.stringify(t, null, 2) + '\n');
}

const THOUGHTS_HEADER =
  '# Thoughts inbox\n\nCaptured from the Atlas hub. Triage each into `vision/` or BRICKS.md `Next up`,\nthen check it off here.\n\n';

function appendToThoughtsMd(repoRoot, th) {
  const p = path.join(repoRoot, 'THOUGHTS.md');
  if (!fs.existsSync(p)) fs.writeFileSync(p, THOUGHTS_HEADER);
  fs.appendFileSync(p, `- [ ] ${th.date} — ${th.text}\n`);
}

// Deliver every pending thought whose target repo is on this device.
function deliverPending() {
  const repos = loadRegistry();
  const t = loadThoughts();
  let changed = false;
  for (const th of t.thoughts) {
    if (th.status !== 'pending' || th.repoId === 'unsorted') continue;
    const repo = repos.find((r) => r.id === th.repoId);
    if (!repo || !fs.existsSync(repo.path) || !isGitRepo(repo.path)) continue;
    appendToThoughtsMd(repo.path, th);
    th.status = 'delivered';
    changed = true;
  }
  if (changed) saveThoughts(t);
}

function addThought(repoId, text) {
  const t = loadThoughts();
  const id = 't' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  const th = { id, date: today(), repoId, text: text.replace(/\s+/g, ' ').trim(), status: 'pending' };
  t.thoughts.push(th);
  saveThoughts(t);
  deliverPending();
  return loadThoughts().thoughts.find((x) => x.id === th.id);
}

// --- atlas-data cloud sync (best-effort: offline is fine, next push carries it) ---

function dataSync(op) {
  const cwd = dataRoot();
  const opts = { cwd, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' };
  try {
    if (op === 'pull') {
      execSync('git pull -q --ff-only', opts);
      return true;
    }
    execSync('git add -A', opts);
    if (execSync('git status --porcelain', opts).trim() !== '') {
      execSync(`git commit -q -m "atlas-data: sync ${today()}"`, opts);
    }
    let ahead = 1; // no upstream: attempt push anyway
    try {
      ahead = Number(execSync('git rev-list --count @{u}..HEAD', opts).trim());
    } catch {
      // no upstream configured yet — fall through to push
    }
    if (ahead > 0) execSync('git push -q', opts);
    return true;
  } catch {
    return false;
  }
}

module.exports = { dataRoot, expandHome, today, loadRegistry, readGit, readProgress, readVision, readStatus, readClaudeSetup, syncAll, state, addThought, loadThoughts, deliverPending, dataSync };
