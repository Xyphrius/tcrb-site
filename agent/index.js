/**
 * TCRB AGENT — The Cannabis Review Board Autonomous Operations System
 *
 * Task Array:
 * 1. DATA SCRAPER    — Pull live NY cannabis data from OCM/state sources every 4 hours
 * 2. SITE UPDATER    — Update website metrics, ticker, and report data
 * 3. SOCIAL ENGINE   — Generate branded Instagram posts (STAGED for review, not posted)
 * 4. FUNDRAISING     — Generate Vineyard Foundation campaign content (STAGED for review)
 * 5. MERCH ENGINE    — Generate merch campaign assets (STAGED for review)
 * 6. MEMBER SIGNUP   — Track and manage subscriber intake
 * 7. DEPLOY          — Push site changes to GitHub, Vercel auto-deploys
 *
 * NOTE: This module exports runFullCycle() but does not auto-run when required.
 * To run the agent: use server.js (production) or `npm run cycle` (one-off).
 */

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

async function runFullCycle() {
  const cycleStart = Date.now();
  log('AGENT', '═══ TCRB AGENT CYCLE START ═══');

  try {
    log('SCRAPER', 'Pulling live NY cannabis market data...');
    const marketData = await scrapeMarketData();
    log('SCRAPER', `Data collected: ${Object.keys(marketData).length} metrics`);

    log('UPDATER', 'Updating site metrics...');
    await updateSiteData(marketData);
    log('UPDATER', 'Site files updated');

    log('SOCIAL', 'Generating branded Instagram content...');
    const posts = await generateSocialPosts(marketData);
    log('SOCIAL', `${posts.length} posts staged for review`);

    log('FUNDRAISING', 'Generating Vineyard Foundation content...');
    await generateFundraisingContent(marketData);
    log('FUNDRAISING', 'Campaign content staged for review');

    log('MERCH', 'Generating merch campaign assets...');
    await generateMerchContent(marketData);
    log('MERCH', 'Merch assets staged for review');

    log('MEMBERS', 'Processing signup queue...');
    await processSignups();
    log('MEMBERS', 'Signups processed');

    log('DEPLOY', 'Pushing site changes to GitHub...');
    await deployToGithub();
    log('DEPLOY', 'Deployed. Vercel auto-building.');

    const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(1);
    log('AGENT', `═══ CYCLE COMPLETE: ${elapsed}s ═══\n`);
    return { success: true, elapsedSeconds: elapsed };
  } catch (err) {
    log('ERROR', `Cycle failed: ${err.message}`);
    console.error(err);
    return { success: false, error: err.message };
  }
}

module.exports = { runFullCycle };

// Direct invocation: `node index.js` runs one cycle and exits
// Production deployment uses server.js (with cron + dashboard)
if (require.main === module) {
  runFullCycle().then(() => process.exit(0));
}
