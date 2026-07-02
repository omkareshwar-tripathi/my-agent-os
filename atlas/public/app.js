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
      ${r.pendingThoughts ? `<span class="badge">${r.pendingThoughts} thought${r.pendingThoughts > 1 ? 's' : ''} queued</span>` : ''}
    </div>
    ${r.vision?.northStar ? `<p class="north">${esc(r.vision.northStar)}</p>` : r.status?.pitch ? `<p class="north">${esc(r.status.pitch)}</p>` : ''}
    ${doing ? `<p class="doing">▶ ${esc(doing.title)}</p>` : r.status?.now ? `<p class="doing">▶ ${esc(r.status.now)}</p>` : '<p class="doing muted">no status yet — run adopt.js</p>'}
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
  try {
    const s = await (await fetch('/api/state')).json();
    const byId = Object.fromEntries(s.repos.map((r) => [r.id, r]));
    const products = s.repos.filter((r) => r.tier === 'product');
    const satellites = s.repos.filter((r) => r.tier === 'satellite');
    document.getElementById('stamp').textContent = s.syncOk ? `synced ${s.generatedAt}` : 'local only — cloud sync failing';
    document.getElementById('products').innerHTML = products.map(productCard).join('');
    document.getElementById('satellites').innerHTML = satellites.map((r) => satelliteRow(r, byId)).join('');
    document.getElementById('unsorted').innerHTML =
      s.unsorted.map((t) => `<li>${esc(t.date)} — ${esc(t.text)}</li>`).join('') || '<li class="muted">empty</li>';
    const target = document.getElementById('target');
    target.innerHTML = '<option value="unsorted">unsorted</option>' +
      products.map((r) => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join('');
  } catch (err) {
    document.getElementById('stamp').textContent = `atlas-data missing? ${err.message}`;
  }
}

document.getElementById('quick-add').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('thought');
  const text = input.value.trim();
  if (!text) return;
  await fetch('/api/thought', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoId: document.getElementById('target').value, text }),
  });
  input.value = '';
  load();
});

load();
