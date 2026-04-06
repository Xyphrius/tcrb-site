/**
 * REVIEW QUEUE — Content Approval System
 * All generated content stages here before going live.
 * Nothing posts without explicit approval.
 */
const fs = require('fs-extra');
const path = require('path');
const { log } = require('../utils/logger');

const PENDING_DIR = path.join(__dirname, '..', 'output', 'pending');
const APPROVED_DIR = path.join(__dirname, '..', 'output', 'approved');
const QUEUE_FILE = path.join(PENDING_DIR, 'review-queue.json');

async function loadQueue() {
  try { return await fs.readJson(QUEUE_FILE); }
  catch { return { items: [], lastUpdated: null }; }
}

async function saveQueue(queue) {
  queue.lastUpdated = new Date().toISOString();
  await fs.writeJson(QUEUE_FILE, queue, { spaces: 2 });
}

/**
 * Stage content for review
 * @param {string} type - 'social' | 'fundraising' | 'merch'
 * @param {object} content - { title, caption, imagePath, data, category }
 */
async function stageForReview(type, content) {
  await fs.ensureDir(PENDING_DIR);
  const queue = await loadQueue();
  
  const item = {
    id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    status: 'pending',
    title: content.title || `${type} content`,
    caption: content.caption || '',
    imagePath: content.imagePath || null,
    category: content.category || type,
    data: content.data || {},
    createdAt: new Date().toISOString(),
    reviewedAt: null,
    reviewNote: null,
  };

  queue.items.push(item);
  await saveQueue(queue);
  log('REVIEW', `Staged: [${item.id}] ${item.type} — "${item.title}"`);
  return item;
}

/**
 * Approve a content item by ID
 */
async function approveItem(itemId, note) {
  await fs.ensureDir(APPROVED_DIR);
  const queue = await loadQueue();
  const idx = queue.items.findIndex(i => i.id === itemId);
  if (idx === -1) throw new Error(`Item not found: ${itemId}`);

  const item = queue.items[idx];
  item.status = 'approved';
  item.reviewedAt = new Date().toISOString();
  item.reviewNote = note || 'Approved';

  // Copy image to approved folder if exists
  if (item.imagePath && await fs.pathExists(item.imagePath)) {
    const dest = path.join(APPROVED_DIR, path.basename(item.imagePath));
    await fs.copy(item.imagePath, dest);
    item.approvedImagePath = dest;
  }

  // Save approved caption
  if (item.caption) {
    const captionPath = path.join(APPROVED_DIR, `${item.id}_caption.txt`);
    await fs.writeFile(captionPath, item.caption);
    item.approvedCaptionPath = captionPath;
  }

  await saveQueue(queue);
  log('REVIEW', `APPROVED: [${item.id}] "${item.title}"`);
  return item;
}

/**
 * Reject a content item
 */
async function rejectItem(itemId, note) {
  const queue = await loadQueue();
  const idx = queue.items.findIndex(i => i.id === itemId);
  if (idx === -1) throw new Error(`Item not found: ${itemId}`);

  queue.items[idx].status = 'rejected';
  queue.items[idx].reviewedAt = new Date().toISOString();
  queue.items[idx].reviewNote = note || 'Rejected';
  await saveQueue(queue);
  log('REVIEW', `REJECTED: [${queue.items[idx].id}] "${queue.items[idx].title}"`);
  return queue.items[idx];
}

/**
 * Get all pending items
 */
async function getPending() {
  const queue = await loadQueue();
  return queue.items.filter(i => i.status === 'pending');
}

/**
 * Get full queue with all statuses
 */
async function getFullQueue() {
  return await loadQueue();
}

module.exports = { stageForReview, approveItem, rejectItem, getPending, getFullQueue, loadQueue };
