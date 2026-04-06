/**
 * TCRB REVIEW SERVER
 * Local dashboard for reviewing and approving agent-generated content
 * Run: node review-server.js
 * Opens: http://localhost:3847
 */
const http = require('http');
const fs = require('fs-extra');
const path = require('path');
const { approveItem, rejectItem, getPending, getFullQueue } = require('./tasks/review-queue');
const { log } = require('./utils/logger');

const PORT = 3847;
const PENDING_DIR = path.join(__dirname, 'output', 'pending');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  try {
    // API: Get all pending items
    if (url.pathname === '/api/pending') {
      const items = await getPending();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(items));
      return;
    }

    // API: Get full queue
    if (url.pathname === '/api/queue') {
      const queue = await getFullQueue();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(queue));
      return;
    }

    // API: Approve item
    if (url.pathname === '/api/approve' && req.method === 'POST') {
      const body = await getBody(req);
      const { id, note } = JSON.parse(body);
      const item = await approveItem(id, note);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, item }));
      return;
    }

    // API: Reject item
    if (url.pathname === '/api/reject' && req.method === 'POST') {
      const body = await getBody(req);
      const { id, note } = JSON.parse(body);
      const item = await rejectItem(id, note);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, item }));
      return;
    }

    // Serve pending images
    if (url.pathname.startsWith('/images/')) {
      const imgName = url.pathname.replace('/images/', '');
      const imgPath = path.join(PENDING_DIR, imgName);
      if (await fs.pathExists(imgPath)) {
        const img = await fs.readFile(imgPath);
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(img);
        return;
      }
    }

    // Dashboard HTML
    if (url.pathname === '/' || url.pathname === '/dashboard') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getDashboardHTML());
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

function getBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

server.listen(PORT, () => {
  log('REVIEW', `Dashboard live at http://localhost:${PORT}`);
  log('REVIEW', 'Waiting for content review...');
});

function getDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TCRB Review Dashboard</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --bg: #0A0A0A; --bg-card: #111111; --bg-elevated: #181818;
  --text-primary: #F5F5F0; --text-secondary: #8A8A85; --text-muted: #555550;
  --accent: #C8FF00; --signal-red: #FF3B30; --border: #222220;
  --approved: #34C759; --rejected: #FF3B30;
}
body { background: var(--bg); color: var(--text-primary); font-family: 'DM Mono', monospace; line-height: 1.6; -webkit-font-smoothing: antialiased; padding: 24px; }
header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 24px; border-bottom: 1px solid var(--border); margin-bottom: 32px; }
.wordmark { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; }
.wordmark span { color: var(--accent); }
.status-bar { font-size: 10px; color: var(--text-muted); letter-spacing: 2px; text-transform: uppercase; }
.status-bar .count { color: var(--accent); font-weight: 500; }
h1 { font-family: 'Instrument Serif', Georgia, serif; font-size: 32px; font-weight: 400; margin-bottom: 32px; }
h1 em { color: var(--accent); font-style: italic; }
.tabs { display: flex; gap: 2px; margin-bottom: 32px; }
.tab { padding: 10px 24px; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
.tab:hover { color: var(--text-primary); }
.tab.active { border-color: var(--accent); color: var(--accent); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 16px; }
.card { background: var(--bg-card); border: 1px solid var(--border); padding: 28px 24px; position: relative; transition: border-color 0.3s; }
.card:hover { border-color: var(--text-muted); }
.card-type { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px; display: inline-block; }
.card-type.social { color: var(--accent); }
.card-type.fundraising { color: var(--signal-red); }
.card-type.merch { color: var(--text-primary); }
.card-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 18px; font-weight: 400; margin-bottom: 12px; line-height: 1.3; }
.card-caption { font-size: 12px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 16px; white-space: pre-line; background: var(--bg); padding: 16px; border-left: 2px solid var(--border); }
.card-image { width: 100%; max-height: 300px; object-fit: contain; margin-bottom: 16px; border: 1px solid var(--border); }
.card-meta { font-size: 10px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 16px; }
.card-actions { display: flex; gap: 8px; }
.btn { padding: 10px 24px; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; border: 1px solid; transition: all 0.2s; background: transparent; }
.btn-approve { border-color: var(--accent); color: var(--accent); }
.btn-approve:hover { background: var(--accent); color: var(--bg); }
.btn-reject { border-color: var(--signal-red); color: var(--signal-red); }
.btn-reject:hover { background: var(--signal-red); color: var(--bg); }
.btn-approve-all { border-color: var(--accent); color: var(--accent); padding: 8px 20px; font-size: 9px; }
.btn-approve-all:hover { background: var(--accent); color: var(--bg); }
.note-input { width: 100%; background: var(--bg); border: 1px solid var(--border); color: var(--text-primary); font-family: 'DM Mono', monospace; font-size: 11px; padding: 8px 12px; margin-bottom: 12px; outline: none; }
.note-input:focus { border-color: var(--accent); }
.note-input::placeholder { color: var(--text-muted); }
.badge { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; padding: 3px 10px; display: inline-block; }
.badge.approved { color: var(--approved); border: 1px solid var(--approved); }
.badge.rejected { color: var(--rejected); border: 1px solid var(--rejected); }
.badge.pending { color: var(--accent); border: 1px solid var(--accent); }
.empty { text-align: center; padding: 80px; color: var(--text-muted); font-size: 13px; }
.toast { position: fixed; bottom: 24px; right: 24px; background: var(--bg-card); border: 1px solid var(--accent); color: var(--accent); padding: 12px 24px; font-size: 11px; letter-spacing: 1px; display: none; z-index: 100; }
</style>
</head>
<body>
<header>
  <div class="wordmark">TCRB REVIEW <span>DASHBOARD</span></div>
  <div class="status-bar">Pending: <span class="count" id="pending-count">0</span> items</div>
</header>

<h1>Content <em>Review</em></h1>

<div class="tabs">
  <button class="tab active" onclick="filterItems('pending')">Pending</button>
  <button class="tab" onclick="filterItems('approved')">Approved</button>
  <button class="tab" onclick="filterItems('rejected')">Rejected</button>
  <button class="tab" onclick="filterItems('all')">All</button>
  <button class="btn-approve-all btn" onclick="approveAll()" style="margin-left:auto;">Approve All Pending</button>
</div>

<div class="grid" id="items-grid"></div>
<div class="toast" id="toast"></div>

<script>
let allItems = [];
let currentFilter = 'pending';

async function loadItems() {
  const res = await fetch('/api/queue');
  const queue = await res.json();
  allItems = queue.items || [];
  document.getElementById('pending-count').textContent = allItems.filter(i => i.status === 'pending').length;
  renderItems();
}

function filterItems(status) {
  currentFilter = status;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  renderItems();
}

function renderItems() {
  const grid = document.getElementById('items-grid');
  let items = currentFilter === 'all' ? allItems : allItems.filter(i => i.status === currentFilter);
  
  if (items.length === 0) {
    grid.innerHTML = '<div class="empty">No ' + currentFilter + ' items.</div>';
    return;
  }

  grid.innerHTML = items.map(item => {
    const typeClass = item.type || 'social';
    const imgTag = item.imagePath ? '<img class="card-image" src="/images/' + item.imagePath.split('/').pop() + '" />' : '';
    const badge = '<span class="badge ' + item.status + '">' + item.status + '</span>';
    const actions = item.status === 'pending' ? 
      '<input class="note-input" id="note-' + item.id + '" placeholder="Review note (optional)">' +
      '<div class="card-actions">' +
        '<button class="btn btn-approve" onclick="approve(\\'' + item.id + '\\')">Approve</button>' +
        '<button class="btn btn-reject" onclick="reject(\\'' + item.id + '\\')">Reject</button>' +
      '</div>' : 
      (item.reviewNote ? '<div class="card-meta">Note: ' + item.reviewNote + '</div>' : '');
    
    return '<div class="card">' +
      '<div class="card-type ' + typeClass + '">' + item.type + ' / ' + (item.category || '') + '</div>' +
      badge +
      '<div class="card-title">' + (item.title || 'Untitled') + '</div>' +
      imgTag +
      '<div class="card-caption">' + (item.caption || 'No caption') + '</div>' +
      '<div class="card-meta">' + new Date(item.createdAt).toLocaleString() + '</div>' +
      actions +
    '</div>';
  }).join('');
}

async function approve(id) {
  const note = document.getElementById('note-' + id)?.value || '';
  await fetch('/api/approve', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id, note }) });
  showToast('Approved: ' + id);
  loadItems();
}

async function reject(id) {
  const note = document.getElementById('note-' + id)?.value || '';
  await fetch('/api/reject', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id, note }) });
  showToast('Rejected: ' + id);
  loadItems();
}

async function approveAll() {
  const pending = allItems.filter(i => i.status === 'pending');
  if (!pending.length) return;
  if (!confirm('Approve all ' + pending.length + ' pending items?')) return;
  for (const item of pending) {
    await fetch('/api/approve', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: item.id, note: 'Batch approved' }) });
  }
  showToast(pending.length + ' items approved');
  loadItems();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 3000);
}

loadItems();
setInterval(loadItems, 10000);
</script>
</body>
</html>`;
}
