/**
 * TASK 7: DEPLOY
 * Commits changes and pushes to GitHub
 * Vercel auto-deploys from main branch
 */
const { execSync } = require('child_process');
const path = require('path');
const { log } = require('../utils/logger');

const SITE_PATH = process.env.SITE_REPO_PATH || '/Users/supertramp/tcrb-site';

async function deployToGithub() {
  try {
    const opts = { cwd: SITE_PATH, encoding: 'utf8', timeout: 30000 };
    
    // Check for changes
    const status = execSync('git status --porcelain', opts).trim();
    if (!status) {
      log('DEPLOY', 'No changes to deploy');
      return { deployed: false, reason: 'no changes' };
    }

    const changedFiles = status.split('\n').length;
    log('DEPLOY', `${changedFiles} file(s) changed`);

    // Stage all changes
    execSync('git add -A', opts);

    // Commit with timestamp
    const now = new Date();
    const ts = now.toISOString().slice(0, 16).replace('T', ' ');
    const msg = `TCRB Agent: data update ${ts}`;
    execSync(`git commit -m "${msg}"`, opts);
    log('DEPLOY', `Committed: ${msg}`);

    // Push
    const pushResult = execSync('git push origin main 2>&1', opts);
    log('DEPLOY', 'Pushed to GitHub. Vercel auto-deploying.');

    return {
      deployed: true,
      commit: msg,
      files: changedFiles,
      timestamp: now.toISOString(),
    };
  } catch (err) {
    log('DEPLOY', `Deploy failed: ${err.message}`);
    throw err;
  }
}

module.exports = { deployToGithub };
