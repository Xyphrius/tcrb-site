/**
 * TASK 6: MEMBER SIGNUP
 * Manages subscriber/member intake queue
 * Reads from contact form submissions, processes and tracks
 */
const fs = require('fs-extra');
const path = require('path');
const { log } = require('../utils/logger');

const SIGNUPS_DIR = path.join(__dirname, '..', 'output', 'signups');
const MEMBERS_FILE = path.join(SIGNUPS_DIR, 'members.json');

async function processSignups() {
  await fs.ensureDir(SIGNUPS_DIR);
  
  // Load existing members
  let members = [];
  try { members = await fs.readJson(MEMBERS_FILE); } catch { members = []; }

  // Check for new signups (from contact form webhook or manual queue)
  const queuePath = path.join(SIGNUPS_DIR, 'queue.json');
  let queue = [];
  try { queue = await fs.readJson(queuePath); } catch { queue = []; }

  if (queue.length === 0) {
    log('MEMBERS', 'No new signups in queue');
    return { processed: 0, total: members.length };
  }

  // Process each signup
  const processed = [];
  for (const signup of queue) {
    const member = {
      id: `TCRB-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: signup.name || 'Unknown',
      email: signup.email || '',
      organization: signup.organization || '',
      inquiryType: signup.inquiryType || 'general',
      message: signup.message || '',
      tier: categorize(signup),
      joinedAt: new Date().toISOString(),
      status: 'active',
    };
    members.push(member);
    processed.push(member.id);
    log('MEMBERS', `New member: ${member.id} (${member.tier})`);
  }

  // Save updated members list and clear queue
  await fs.writeJson(MEMBERS_FILE, members, { spaces: 2 });
  await fs.writeJson(queuePath, [], { spaces: 2 });

  // Generate summary
  const summary = {
    processed: processed.length,
    total: members.length,
    byTier: members.reduce((acc, m) => { acc[m.tier] = (acc[m.tier] || 0) + 1; return acc; }, {}),
    lastProcessed: new Date().toISOString(),
  };
  
  const summaryPath = path.join(SIGNUPS_DIR, 'summary.json');
  await fs.writeJson(summaryPath, summary, { spaces: 2 });
  log('MEMBERS', `Total members: ${members.length} | New: ${processed.length}`);
  
  return summary;
}

function categorize(signup) {
  const type = (signup.inquiryType || '').toLowerCase();
  if (type === 'data' || type === 'data access') return 'premium';
  if (type === 'partnership') return 'partner';
  if (type === 'media') return 'media';
  if (type === 'vineyard') return 'foundation';
  return 'general';
}

module.exports = { processSignups };
