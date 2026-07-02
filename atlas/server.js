'use strict';
// Atlas hub — server. GET /api/state re-syncs from the repos on every call
// (sync-on-page-load: the dashboard can never be stale on this device).
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const lib = require('./lib');

const PORT = Number(process.env.ATLAS_PORT || 7843);
const PUBLIC = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/api/state') {
    try {
      const pullOk = lib.dataSync('pull');
      const s = lib.state();
      const pushOk = lib.dataSync('push');
      if (!pullOk || !pushOk) console.log(`atlas-data sync warning: pull=${pullOk} push=${pushOk}`);
      s.syncOk = pullOk && pushOk;
      return json(res, 200, s);
    } catch (err) {
      return json(res, 500, { error: err.message });
    }
  }
  if (req.method === 'POST' && url.pathname === '/api/thought') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        const { repoId, text } = JSON.parse(body);
        if (!text || !text.trim()) return json(res, 400, { error: 'empty thought' });
        if (repoId && repoId !== 'unsorted' && !lib.loadRegistry().some((r) => r.id === repoId)) {
          return json(res, 400, { error: 'unknown repoId' });
        }
        const th = lib.addThought(repoId || 'unsorted', text);
        lib.dataSync('push');
        json(res, 200, th);
      } catch (err) {
        json(res, 400, { error: err.message });
      }
    });
    return;
  }
  const rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const file = path.join(PUBLIC, path.normalize(rel));
  if (!file.startsWith(PUBLIC) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404);
    return res.end('not found');
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' });
  fs.createReadStream(file).pipe(res);
});

if (require.main === module) {
  lib.dataSync('pull');
  server.listen(PORT, '127.0.0.1', () => console.log(`Atlas hub → http://127.0.0.1:${PORT}`));
}
module.exports = { server };
