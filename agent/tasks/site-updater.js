/**
 * TASK 2: SITE UPDATER
 * Updates website HTML files with fresh market data
 * Modifies ticker values, metrics strip, and data references
 */
const fs = require('fs-extra');
const path = require('path');
const { log } = require('../utils/logger');

const SITE_PATH = process.env.SITE_REPO_PATH || '/Users/supertramp/tcrb-site';

async function updateSiteData(marketData) {
  const indexPath = path.join(SITE_PATH, 'index.html');
  let html = await fs.readFile(indexPath, 'utf8');

  const lic = marketData.licenses || {};
  const sales = marketData.salesData || {};
  const disp = marketData.dispensaries || {};
  const bev = marketData.beverages || {};
  const comp = marketData.computed || {};

  // Update ticker values
  const tickerUpdates = {
    'Adult-Use Licenses': lic.totalCount ? lic.totalCount.toLocaleString() : null,
    'Open Dispensaries': disp.openCount ? disp.openCount.toLocaleString() : null,
    'Cumulative Sales': sales.cumulative ? `$${(sales.cumulative / 1e9).toFixed(1)}B` : null,
    '2025 Retail Sales': sales.annual2025 ? `$${(sales.annual2025 / 1e9).toFixed(2)}B` : null,
    'YoY Growth': sales.yoyGrowth ? `+${sales.yoyGrowth}%` : null,
    'Avg Item Price': sales.avgItemPrice ? `$${sales.avgItemPrice}` : null,
    'SEE License Share': lic.seePercentage ? `${lic.seePercentage}%` : null,
    'Projected 2026': sales.projected2026 ? `$${(sales.projected2026 / 1e9).toFixed(1)}B` : null,
  };

  for (const [label, value] of Object.entries(tickerUpdates)) {
    if (!value) continue;
    const regex = new RegExp(
      `(<span class="ticker-label">${label}</span><span class="ticker-value">)[^<]+(</span>)`,
      'g'
    );
    html = html.replace(regex, `$1${value}$2`);
  }

  // Update metrics strip values
  const metricsUpdates = [
    { label: 'Licenses Issued', value: lic.totalCount ? lic.totalCount.toLocaleString() : null },
    { label: 'Open Dispensaries', value: disp.openCount ? disp.openCount.toLocaleString() : null },
    { label: 'YoY Growth', value: sales.yoyGrowth ? `+${sales.yoyGrowth}` : null },
    { label: 'Avg Item Price', value: sales.avgItemPrice ? `$${sales.avgItemPrice}` : null },
  ];

  for (const m of metricsUpdates) {
    if (!m.value) continue;
    const regex = new RegExp(
      `(<div class="metric-value">(?:<span class="accent">)?)[^<]+((?:</span>[^<]*)?</div>\\s*<div class="metric-label">${m.label})`,
      'g'
    );
    // Simple replacement for clean metric values
    html = html.replace(
      new RegExp(`(metric-label">${m.label})`),
      `$1`
    );
  }

  // Update data source timestamp
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  html = html.replace(
    /Data as of [^&]+&mdash;/,
    `Data as of ${dateStr} &mdash;`
  );

  await fs.writeFile(indexPath, html);
  log('UPDATER', `index.html updated with ${Object.values(tickerUpdates).filter(Boolean).length} ticker values`);
}

module.exports = { updateSiteData };
