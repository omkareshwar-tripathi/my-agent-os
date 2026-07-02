'use strict';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ago = (d) => (d === 0 ? 'today' : d === 1 ? 'yesterday' : `${d}d ago`);

function productCard(r) {
  const g = r.git;
  const doing = r.progress?.doing?.[0];
  const nextCount = r.progress?.next?.length ?? 0;
  return `<article class="card ${r.activity}">
    <div class="card-head">
      <span class="dot"></span><strong>${esc(r.name)}</strong>
      <span class="meta">${r.activity}${g ? ' · ' + ago(g.daysAway) : ''}</span>
      ${r.present ? '' : '<span class="badge">not on this device</span>'}
    </div>
    ${r.vision?.northStar ? `<p class="north">${esc(r.vision.northStar)}</p>` : ''}
    ${doing ? `<p class="doing">▶ ${esc(doing.title)}</p>` : '<p class="doing muted">no BRICKS.md yet</p>'}
    <p class="foot">
      ${g ? `<code>${esc(g.branch)}</code> ${esc(g.lastCommitSubject)}` : 'no git data'}
      ${nextCount ? ` · ${nextCount} next` : ''}
    </p>
  </article>`;
}

function satelliteRow(r, byId) {
  const g = r.git;
  const rel = r.satelliteOf ? `→ ${esc(byId[r.satelliteOf]?.name || r.satelliteOf)}` : '(infra)';
  return `<li><strong>${esc(r.name)}</strong> <span class="meta">${rel}${g ? ` · ${ago(g.daysAway)} · ${esc(g.lastCommitSubject)}` : ''}</span></li>`;
}

async function load() {
  const s = await (await fetch('/api/state')).json();
  const byId = Object.fromEntries(s.repos.map((r) => [r.id, r]));
  const products = s.repos.filter((r) => r.tier === 'product');
  const satellites = s.repos.filter((r) => r.tier === 'satellite');
  document.getElementById('stamp').textContent = `synced ${s.generatedAt}`;
  document.getElementById('products').innerHTML = products.map(productCard).join('');
  document.getElementById('satellites').innerHTML = satellites.map((r) => satelliteRow(r, byId)).join('');
  const target = document.getElementById('target');
  target.innerHTML = '<option value="unsorted">unsorted</option>' +
    products.map((r) => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join('');
}

load();
