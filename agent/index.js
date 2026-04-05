/**
 * TCRB AGENT — The Cannabis Review Board Autonomous Operations System
 * 
 * Task Array:
 * 1. DATA SCRAPER    — Pull live NY cannabis data from OCM/state sources every 4 hours
 * 2. SITE UPDATER    — Update website metrics, ticker, and report data
 * 3. SOCIAL ENGINE   — Generate branded Instagram posts from market data
 * 4. FUNDRAISING     — Generate Vineyard Foundation campaign content
 * 5. MERCH ENGINE    — Generate merch campaign assets
 * 6. MEMBER SIGNUP   — Track and manage subscriber intake
 * 7. DEPLOY          — Push changes to GitHub, Vercel auto-deploys
 */

const cron = require('node-cron');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { scrapeMarketData } = require('./tasks/data-scraper');
const { updateSiteData } = require('./tasks/site-updater');
const { generateSocialPosts } = require('./tasks/social-engine');
const { generateFundraisingContent } = require('./tasks/fundraising');
const { generateMerchContent } = require('./tasks/merch-engine');
const { processSignups } = require('./tasks/member-signup');
const { deployToGithub } = require('./tasks/deploy');
const { log } = require('./utils/logger');

// ═══════════════════════════════════════
// MASTER TASK ORCHESTRATOR
// ═══════════════════════════════════════

async function runFullCycle() {
  const cycleStart = Date.now();
  log('AGENT', '═══ TCRB AGENT CYCLE START ═══');

  try {
    // TASK 1: Scrape fresh market data
    log('SCRAPER', 'Pulling live NY cannabis market data...');
    const marketData = await scrapeMarketData();
    log('SCRAPER', `Data collected: ${Object.keys(marketData).length} metrics`);

    // TASK 2: Update website with new data
    log('UPDATER', 'Updating site metrics...');
    await updateSiteData(marketData);
    log('UPDATER', 'Site files updated');

    // TASK 3: Generate social media posts
    log('SOCIAL', 'Generating branded Instagram content...');
    const posts = await generateSocialPosts(marketData);
    log('SOCIAL', `${posts.length} posts generated`);

    // TASK 4: Fundraising content
    log('FUNDRAISING', 'Generating Vineyard Foundation content...');
    await generateFundraisingContent(marketData);
    log('FUNDRAISING', 'Campaign content ready');

    // TASK 5: Merch campaign content
    log('MERCH', 'Generating merch campaign assets...');
    await generateMerchContent(marketData);
    log('MERCH', 'Merch assets ready');

    // TASK 6: Process member signups
    log('MEMBERS', 'Processing signup queue...');
    await processSignups();
    log('MEMBERS', 'Signups processed');

    // TASK 7: Deploy to GitHub → Vercel
    log('DEPLOY', 'Pushing to GitHub...');
    await deployToGithub();
    log('DEPLOY', 'Deployed. Vercel auto-building.');

    const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(1);
    log('AGENT', `═══ CYCLE COMPLETE: ${elapsed}s ═══\n`);

  } catch (err) {
    log('ERROR', `Cycle failed: ${err.message}`);
    console.error(err);
  }
}

// ═══════════════════════════════════════
// CRON SCHEDULER — Every 4 hours
// ═══════════════════════════════════════

const interval = process.env.DATA_UPDATE_INTERVAL_HOURS || 4;

// Run on startup
log('AGENT', `TCRB Agent initialized. Cycle interval: ${interval}h`);
log('AGENT', `Site repo: ${process.env.SITE_REPO_PATH}`);
runFullCycle();

// Schedule: every N hours at minute 0
cron.schedule(`0 */${interval} * * *`, () => {
  runFullCycle();
});

// Also expose for manual trigger
module.exports = { runFullCycle };
