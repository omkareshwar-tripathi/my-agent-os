'use strict';
// Atlas dashboard — generates ONE static HTML page from the registry.
// No server: run it, open the file. Usage:
//   node atlas/dashboard.js [output.html]   (default: <atlas-data>/dashboard.html)
// Zero dependencies — Node built-ins only.

const fs = require('node:fs');
const path = require('node:path');
const lib = require('./lib');

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ago = (d) => (d === 0 ? 'today' : d === 1 ? 'yesterday' : `${d}d ago`);
const li = (items) => items.map((x) => `<li>${esc(x)}</li>`).join('');

function card(r) {
  const st = r.status;
  const now = st?.now || r.progress?.doing?.[0]?.title;
  const next = (st?.next?.length ? st.next : (r.progress?.next || []).map((n) => n.title)).slice(0, 2);
  const pitch = st?.pitch || r.vision?.northStar || '';
  const cl = r.claude;
  const hooks = cl && Object.keys(cl.hooks).length
    ? `<ul>${Object.entries(cl.hooks).map(([ev, s]) => `<li><strong>${esc(ev)}</strong> → ${esc(s.join(', '))}</li>`).join('')}</ul>`
    : '<p class="muted">no hooks wired — run adopt here</p>';
  return `<article class="card ${esc(r.activity)}">
  <div class="head"><span class="dot"></span><strong>${esc(r.name)}</strong>
    <span class="meta">${esc(r.activity)}${r.git ? ' · ' + ago(r.git.daysAway) : ''}</span>
    ${r.present ? '' : '<span class="badge">not on this device</span>'}</div>
  ${r.error ? `<p class="err">⚠ ${esc(r.error)}</p>` : ''}
  ${now ? `<p class="doing">▶ ${esc(now)}</p>` : r.present && !r.error ? '<p class="doing muted">no STATUS.md yet — run adopt here</p>' : ''}
  ${next.map((n) => `<p class="next">○ ${esc(n)}</p>`).join('')}
  ${pitch ? `<p class="pitch">${esc(pitch)}</p>` : ''}
  ${r.present && !r.error ? `<details><summary>details & Claude setup</summary>
    ${st?.recent?.length ? `<h4>Recently done</h4><ul>${li(st.recent)}</ul>` : ''}
    ${r.progress?.doing?.length ? `<h4>Current brick</h4><p>▶ ${esc(r.progress.doing[0].title)}</p>` : ''}
    ${r.git ? `<h4>Git</h4><p><code>${esc(r.git.branch)}</code> ${esc(r.git.lastCommitSubject)} · ${esc(r.git.lastCommitDate)} · ${r.git.cleanTree ? 'clean tree' : 'uncommitted changes'}</p>` : ''}
    <h4>Hooks</h4>${hooks}
    ${cl?.skills?.length ? `<p class="meta">Skills: ${esc(cl.skills.join(', '))}</p>` : ''}
    ${cl?.commands?.length ? `<p class="meta">Commands: /${esc(cl.commands.join(', /'))}</p>` : ''}
    ${cl?.plugins?.length ? `<p class="meta">Plugins: ${esc(cl.plugins.join(', '))}</p>` : ''}
    ${cl?.docs?.length ? `<p class="meta">Docs: ${esc(cl.docs.join(', '))}</p>` : ''}
    ${st?.updated ? `<p class="meta">STATUS.md updated ${esc(st.updated)}</p>` : ''}
  </details>` : ''}
</article>`;
}

function render(repos) {
  const byId = Object.fromEntries(repos.map((r) => [r.id, r]));
  const products = repos.filter((r) => r.tier === 'product');
  const satellites = repos.filter((r) => r.tier !== 'product');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Atlas</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root { --bg:#f6f7f9; --card:#fff; --ink:#1c2330; --muted:#68738a; --line:#e3e7ee;
  --active:#2e9e6b; --parked:#d99a2b; --dormant:#98a1b3; }
* { box-sizing:border-box } body { margin:0; background:var(--bg); color:var(--ink);
  font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
main { max-width:72rem; margin:0 auto; padding:1.2rem 1.4rem 3rem }
h1 { font-size:1.15rem } h2 { font-size:.8rem; text-transform:uppercase; letter-spacing:.08em; color:var(--muted) }
.stamp { color:var(--muted); font-size:.8rem }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(20rem,1fr)); gap:.9rem }
.card { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:.9rem 1rem }
.head { display:flex; align-items:center; gap:.5rem }
.dot { width:9px; height:9px; border-radius:50%; background:var(--dormant) }
.card.active .dot { background:var(--active) } .card.parked .dot { background:var(--parked) }
.meta { color:var(--muted); font-size:.8rem; margin-left:auto }
.badge { font-size:.7rem; background:var(--bg); border:1px solid var(--line); border-radius:6px; padding:.1rem .4rem; color:var(--muted) }
.doing { margin:.4rem 0 .2rem; font-weight:500 } .muted { color:var(--muted); font-weight:400 }
.next { margin:.1rem 0; font-size:.85rem; color:var(--muted) }
.pitch { margin:.45rem 0 0; font-size:.8rem; color:var(--muted); font-style:italic;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
.err { color:#b3392e; font-size:.85rem; margin:.4rem 0 .2rem }
details { margin-top:.6rem; font-size:.85rem } summary { color:var(--muted); cursor:pointer }
details h4 { font-size:.7rem; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin:.8rem 0 .1rem }
details p, details ul { margin:.2rem 0 } details ul { padding-left:1.2rem }
code { background:var(--bg); padding:0 .3rem; border-radius:4px }
ul.sat { list-style:none; padding:0; display:grid; gap:.4rem }
ul.sat li { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:.5rem .9rem }
footer { margin-top:2rem; color:var(--muted); font-size:.8rem }
</style></head><body><main>
<h1>Atlas <span class="stamp">generated ${esc(lib.today())}</span></h1>
<section><h2>Products</h2><div class="grid">${products.map(card).join('\n')}</div></section>
${satellites.length ? `<section><h2>Satellites &amp; infra</h2><ul class="sat">${satellites.map((r) =>
    `<li><strong>${esc(r.name)}</strong> <span class="meta">${r.satelliteOf ? '→ ' + esc(byId[r.satelliteOf]?.name || r.satelliteOf) : '(infra)'}${r.git ? ' · ' + ago(r.git.daysAway) : ''}</span></li>`).join('')}</ul></section>` : ''}
<footer>Static snapshot — refresh with: <code>node atlas/dashboard.js</code> (or ask Claude: “refresh my dashboard”).</footer>
</main></body></html>\n`;
}

const out = process.argv[2] || path.join(lib.dataRoot(), 'dashboard.html');
fs.writeFileSync(out, render(lib.gather()));
console.log('Atlas dashboard → ' + out);
