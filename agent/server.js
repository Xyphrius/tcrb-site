/**
 * TCRB AGENT — Production Entry Point
 *
 * Starts the HTTP review dashboard and schedules recurring data+content cycles.
 * This is the process launched by start.sh inside the Fly container.
 *
 * Env:
 *   PORT                       — HTTP port (default 8080)
 *   HOST                       — Bind host (default 0.0.0.0)
 *   REVIEW_USERNAME            — Basic auth username (default 'tcrb')
 *   REVIEW_PASSWORD            — Basic auth password (required in prod)
 *   DATA_UPDATE_INTERVAL_HOURS — Cycle cadence (default 4)
 *   RUN_INITIAL_CYCLE          — '1' to run a cycle at boot (default '1')
 *   GITHUB_TOKEN               — Required; used by start.sh and deploy task
 */
require('dotenv').config();

const cron = require('node-cron');
const { runFullCycle } = require('./index');
const { createServer } = require('./review-server');
const { log } = require('./utils/logger');

const INTERVAL_HOURS = Math.max(1, parseInt(process.env.DATA_UPDATE_INTERVAL_HOURS || '4', 10));
const RUN_INITIAL = process.env.RUN_INITIAL_CYCLE !== '0';

let cycleRunning = false;

async function safeCycle(trigger) {
  if (cycleRunning) {
    log('AGENT', `Cycle already running; skipping ${trigger} trigger.`);
    return;
  }
  cycleRunning = true;
  try {
    log('AGENT', `Starting cycle (trigger: ${trigger})...`);
    const result = await runFullCycle();
    if (!result?.success) log('AGENT', `Cycle returned failure: ${result?.error || 'unknown'}`);
  } catch (err) {
    log('ERROR', `Unhandled cycle error: ${err.message}`);
    console.error(err);
  } finally {
    cycleRunning = false;
  }
}

// 1. Start HTTP dashboard + health endpoint first so Fly health checks pass fast.
createServer();

// 2. Schedule recurring cycles. node-cron expression: every N hours on the hour.
const cronExpr = `0 */${INTERVAL_HOURS} * * *`;
cron.schedule(cronExpr, () => safeCycle('cron'));
log('AGENT', `Cron scheduled: ${cronExpr} (every ${INTERVAL_HOURS}h)`);

// 3. Optional initial cycle on boot, non-blocking.
if (RUN_INITIAL) {
  setTimeout(() => safeCycle('boot'), 5000);
}

// Graceful shutdown
function shutdown(sig) {
  log('AGENT', `Received ${sig}, shutting down.`);
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  log('ERROR', `Unhandled rejection: ${reason}`);
  console.error(reason);
});
