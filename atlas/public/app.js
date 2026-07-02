'use strict';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ago = (d) => (d === 0 ? 'today' : d === 1 ? 'yesterday' : `${d}d ago`);
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

let byId = {};

// Compact card: leads with Now + Next (what to do), pitch shrinks to one line.
function productCard(r) {
  const g = r.git;
  const now = r.progress?.doing?.[0]?.title || r.status?.now;
  const next = (r.status?.next?.length ? r.status.next : (r.progress?.next || []).map((n) => n.title)).slice(0, 2);
  const pitch = r.status?.pitch || r.vision?.northStar || '';
  return `<article class="card ${r.activity}" data-id="${esc(r.id)}">
    <div class="card-head">
      <span class="dot"></span><strong>${esc(r.name)}</strong>
      <span class="meta">${r.activity}${g ? ' · ' + ago(g.daysAway) : ''}</span>
      ${r.present ? '' : '<span class="badge">not on this device</span>'}
      ${r.pendingThoughts ? `<span class="badge">${r.pendingThoughts} queued</span>` : ''}
    </div>
    ${now ? `<p class="doing">▶ ${esc(clip(now, 90))}</p>` : '<p class="doing muted">no status yet — run adopt.js</p>'}
    ${next.map((n) => `<p class="next-item">○ ${esc(clip(n, 80))}</p>`).join('')}
    ${pitch ? `<p class="pitch">${esc(pitch)}</p>` : ''}
  </article>`;
}

function satelliteRow(r) {
  const g = r.git;
  const rel = r.satelliteOf ? `→ ${esc(byId[r.satelliteOf]?.name || r.satelliteOf)}` : '(infra)';
  return `<li><strong>${esc(r.name)}</strong> <span class="meta">${rel}${g ? ` · ${ago(g.daysAway)}` : ''}</span></li>`;
}

// Detail: everything about one repo — status, git, and the Claude setup applied.
function detailHtml(r) {
  const g = r.git;
  const st = r.status;
  const cl = r.claude;
  const list = (items) => `<ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  return `<button id="detail-close" aria-label="close">×</button>
    <h2>${esc(r.name)} <span class="meta">${r.activity}${g ? ` · <code>${esc(g.branch)}</code> · ${ago(g.daysAway)}` : ''}</span></h2>
    ${st?.pitch || r.vision?.northStar ? `<p class="north">${esc(st?.pitch || r.vision.northStar)}</p>` : ''}
    ${st?.now ? `<h3>Now</h3><p>▶ ${esc(st.now)}</p>` : ''}
    ${st?.next?.length ? `<h3>Next</h3>${list(st.next)}` : ''}
    ${st?.recent?.length ? `<h3>Recently done</h3>${list(st.recent)}` : ''}
    ${r.progress?.doing?.length ? `<h3>Current brick</h3><p>▶ ${esc(r.progress.doing[0].title)}</p>` : ''}
    ${g ? `<h3>Git</h3><p><code>${esc(g.branch)}</code> ${esc(g.lastCommitSubject)} · ${esc(g.lastCommitDate)} · ${g.cleanTree ? 'clean tree' : 'uncommitted changes'}</p>` : ''}
    <h3>Claude setup applied</h3>
    ${cl && Object.keys(cl.hooks).length
      ? `<ul>${Object.entries(cl.hooks).map(([ev, scripts]) => `<li><strong>${esc(ev)}</strong> → ${esc(scripts.join(', '))}</li>`).join('')}</ul>`
      : '<p class="muted">no hooks wired — run adopt.js here</p>'}
    ${cl?.skills?.length ? `<p class="meta">Skills: ${esc(cl.skills.join(', '))}</p>` : ''}
    ${cl?.commands?.length ? `<p class="meta">Commands: /${esc(cl.commands.join(', /'))}</p>` : ''}
    ${cl?.plugins?.length ? `<p class="meta">Plugins: ${esc(cl.plugins.join(', '))}</p>` : ''}
    ${cl?.docs?.length ? `<p class="meta">Docs: ${esc(cl.docs.join(', '))}</p>` : ''}
    ${r.thoughts?.length
      ? `<h3>Thoughts filed</h3><ul>${r.thoughts.map((t) => `<li>${esc(t.date)} — ${esc(t.text)} <span class="meta">${t.status === 'delivered' ? '✓ in THOUGHTS.md' : 'queued'}</span></li>`).join('')}</ul>`
      : ''}
    ${st?.updated ? `<p class="meta">STATUS.md updated ${esc(st.updated)}</p>` : ''}`;
}

function openDetail(id) {
  const r = byId[id];
  if (!r) return;
  document.getElementById('detail').innerHTML = detailHtml(r);
  document.getElementById('detail-overlay').hidden = false;
}
function closeDetail() {
  document.getElementById('detail-overlay').hidden = true;
}

async function load() {
  try {
    const s = await (await fetch('/api/state')).json();
    byId = Object.fromEntries(s.repos.map((r) => [r.id, r]));
    const products = s.repos.filter((r) => r.tier === 'product');
    const satellites = s.repos.filter((r) => r.tier === 'satellite');
    document.getElementById('stamp').textContent = s.syncOk ? `synced ${s.generatedAt}` : 'local only — cloud sync failing';
    document.getElementById('products').innerHTML = products.map(productCard).join('');
    document.getElementById('satellites').innerHTML = satellites.map(satelliteRow).join('');
    document.getElementById('unsorted').innerHTML =
      s.unsorted.map((t) => `<li>${esc(t.date)} — ${esc(t.text)}</li>`).join('') || '<li class="muted">empty</li>';
    const target = document.getElementById('target');
    const prev = target.value;
    target.innerHTML = '<option value="unsorted">unsorted</option>' +
      products.map((r) => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join('');
    if ([...target.options].some((o) => o.value === prev)) target.value = prev;
  } catch (err) {
    document.getElementById('stamp').textContent = `atlas-data missing? ${err.message}`;
  }
}

document.getElementById('products').addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (card) openDetail(card.dataset.id);
});
document.getElementById('detail-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'detail-overlay' || e.target.id === 'detail-close') closeDetail();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDetail();
});

document.getElementById('quick-add').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('thought');
  const text = input.value.trim();
  if (!text) return;
  const sel = document.getElementById('target');
  const targetName = sel.options[sel.selectedIndex]?.text || 'unsorted';
  const res = await fetch('/api/thought', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoId: sel.value, text }),
  });
  input.value = '';
  await load();
  const stamp = document.getElementById('stamp');
  stamp.textContent = res.ok
    ? `${stamp.textContent} · thought filed → ${targetName}`
    : `${stamp.textContent} · thought FAILED to file`;
});

load();
