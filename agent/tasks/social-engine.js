/**
 * TASK 3: SOCIAL ENGINE
 * Generates branded Instagram posts from market data
 * Produces: data drops, signal reports, regulatory alerts, price signals
 * Output: PNG images + caption text files
 */
const { createCanvas } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const { log } = require('../utils/logger');
const { generateContent } = require('../utils/ai');
const brand = require('../utils/brand');

const OUT_DIR = process.env.INSTAGRAM_OUTPUT_PATH || '/Users/supertramp/tcrb-site/instagram';
const W = 1080, H = 1080;

async function generateSocialPosts(marketData) {
  await fs.ensureDir(OUT_DIR);
  const posts = [];
  const lic = marketData.licenses || {};
  const sales = marketData.salesData || {};
  const disp = marketData.dispensaries || {};
  const bev = marketData.beverages || {};
  const comp = marketData.computed || {};
  const ts = new Date().toISOString().slice(0, 10);

  // Determine which posts to generate based on data changes
  const postQueue = [
    {
      type: 'data_drop',
      metric: lic.totalCount?.toLocaleString(),
      label: 'ADULT-USE LICENSES ISSUED',
      sublabel: 'NEW YORK STATE',
      filename: `dd_licenses_${ts}`,
    },
    {
      type: 'data_drop',
      metric: disp.openCount?.toLocaleString(),
      label: 'DISPENSARIES OPEN',
      sublabel: comp.conversionRate ? `${comp.conversionRate}% CONVERSION RATE` : '',
      filename: `dd_dispensaries_${ts}`,
    },
    {
      type: 'data_drop',
      metric: `$${(sales.cumulative / 1e9).toFixed(1)}B`,
      label: 'CUMULATIVE SALES',
      sublabel: 'DEC 2022 - PRESENT',
      accentMetric: true,
      filename: `dd_sales_${ts}`,
    },
  ];

  // Generate each post image
  for (const post of postQueue) {
    try {
      const imgPath = path.join(OUT_DIR, `${post.filename}.png`);
      await renderDataDrop(post, imgPath);
      
      // Generate caption via AI
      const caption = await generateCaption(post, marketData);
      const captionPath = path.join(OUT_DIR, `${post.filename}_caption.txt`);
      await fs.writeFile(captionPath, caption);
      
      posts.push({ image: imgPath, caption: captionPath, type: post.type });
      log('SOCIAL', `Generated: ${post.filename}`);
    } catch (err) {
      log('SOCIAL', `Failed: ${post.filename} — ${err.message}`);
    }
  }

  return posts;
}

async function renderDataDrop(post, outPath) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const c = brand.colors;

  // Background
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);

  // Wordmark
  ctx.font = '16px monospace';
  ctx.fillStyle = c.textPrimary;
  ctx.fillText('THE CANNABIS REVIEW', 60, 70);
  const wmWidth = ctx.measureText('THE CANNABIS REVIEW').width;
  ctx.fillStyle = c.accent;
  ctx.fillText(' BOARD', 60 + wmWidth, 70);

  // Divider
  ctx.strokeStyle = c.border;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 100); ctx.lineTo(W, 100); ctx.stroke();

  // Tag
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = c.accent;
  ctx.fillText('DATA DROP', 60, 140);

  // Main metric
  ctx.font = 'bold 100px monospace';
  ctx.fillStyle = post.accentMetric ? c.accent : c.textPrimary;
  ctx.fillText(post.metric || '', 60, 320);

  // Divider
  ctx.beginPath(); ctx.moveTo(0, 380); ctx.lineTo(W, 380); ctx.stroke();

  // Label
  ctx.font = '30px monospace';
  ctx.fillStyle = c.textSecondary;
  ctx.fillText(post.label || '', 60, 430);

  // Sublabel
  ctx.font = '20px monospace';
  ctx.fillStyle = c.textMuted;
  ctx.fillText(post.sublabel || '', 60, 480);

  // Bottom bar
  ctx.beginPath(); ctx.moveTo(0, H - 80); ctx.lineTo(W, H - 80); ctx.stroke();
  ctx.font = '16px monospace';
  ctx.fillStyle = c.accent;
  ctx.fillText('TCRB', 60, H - 50);
  ctx.fillStyle = c.textMuted;
  ctx.fillText('SYSTEM OF RECORD', W - 260, H - 50);

  // Save
  const buf = canvas.toBuffer('image/png');
  await fs.writeFile(outPath, buf);
}

async function generateCaption(post, marketData) {
  const prompt = `Write an Instagram caption for TCRB (The Cannabis Review Board).
Post type: ${post.type}
Metric: ${post.metric}
Label: ${post.label}
Context data: ${JSON.stringify({
    totalLicenses: marketData.licenses?.totalCount,
    dispensaries: marketData.dispensaries?.openCount,
    yoyGrowth: marketData.salesData?.yoyGrowth,
    avgPrice: marketData.salesData?.avgItemPrice,
  })}

Rules:
- 3 lines maximum
- Line 1: the data point or headline
- Line 2-3: one sentence of context
- No emojis, no exclamation marks, no hashtags in caption
- End with "TCRB. System of record." or similar tag
- Tone: precise, controlled, analytical`;

  try {
    return await generateContent(prompt, { maxTokens: 200 });
  } catch {
    // Fallback if AI unavailable
    return `${post.metric}\n${post.label}.\nNew York State cannabis market.\nTCRB. System of record.`;
  }
}

module.exports = { generateSocialPosts };
