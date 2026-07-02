'use strict';
// Atlas — shared library. Per-repo readers over a plain registry file.
// No server, no cache, no cloud sync: the repos themselves are the store.
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
// Local calendar date — matches git commit dates and `date +%F` on this machine.
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
  const commitDay = git(repoRoot, 'log -1 --format=%cs');
  // Clamped: a commit stamped "tomorrow" in another timezone must not go negative.
  const daysAway = Math.max(0, Math.round((Date.parse(today()) - Date.parse(commitDay)) / 86400000));
  return {
    branch: git(repoRoot, 'rev-parse --abbrev-ref HEAD'),
    lastCommitDate: commitDay,
    lastCommitSubject: git(repoRoot, 'log -1 --format=%s'),
    cleanTree: git(repoRoot, 'status --porcelain') === '',
    daysAway,
  };
}

// --- markdown helpers ---

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

// --- progress (BRICKS.md) ---

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
  return { doing: doing ? [doing] : [], next, blocked, done: done.slice(0, 8) };
}

// --- vision (vision/README.md) ---

const CAPS_HEADING_RE = /^##\s+(capabilities\b|what's inside\b)/i;

function readVision(repoRoot) {
  const lines = fs.readFileSync(path.join(repoRoot, 'vision/README.md'), 'utf8').split('\n');
  let northStar = '';
  const nsIdx = lines.findIndex((l) => /\*\*North star:\*\*/i.test(l));
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
  return { northStar, pitch, capabilities, openQuestions };
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
  const out = { plugins: [], hooks: {}, skills: [], commands: [], docs: [] };
  try {
    const s = JSON.parse(fs.readFileSync(path.join(repoRoot, '.claude', 'settings.json'), 'utf8'));
    out.plugins = Object.keys(s.enabledPlugins || {}).filter((k) => s.enabledPlugins[k]);
    for (const [event, entries] of Object.entries(s.hooks || {})) {
      const scripts = [];
      for (const e of entries) {
        for (const h of e.hooks || []) {
          const m = (h.command || '').match(/([\w.-]+\.(?:sh|js|cjs))/);
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

// --- the aggregate view: one pass over the registry, per-repo fault isolation ---

function gather() {
  return loadRegistry().map((r) => {
    const out = { ...r, present: false, activity: 'unknown', git: null, progress: null, vision: null, status: null, claude: null, error: null };
    try {
      out.present = fs.existsSync(r.path) && isGitRepo(r.path);
      if (!out.present) return out;
      out.git = readGit(r.path);
      out.activity = out.git.daysAway < 14 ? 'active' : out.git.daysAway < 90 ? 'parked' : 'dormant';
      if (fs.existsSync(path.join(r.path, 'BRICKS.md'))) out.progress = readProgress(r.path);
      if (fs.existsSync(path.join(r.path, 'vision/README.md'))) out.vision = readVision(r.path);
      if (fs.existsSync(path.join(r.path, 'STATUS.md'))) out.status = readStatus(r.path);
      out.claude = readClaudeSetup(r.path);
    } catch (err) {
      out.error = (err.message || String(err)).split('\n')[0];
    }
    return out;
  });
}

module.exports = { dataRoot, expandHome, today, loadRegistry, readProgress, readVision, readStatus, readClaudeSetup, gather };
