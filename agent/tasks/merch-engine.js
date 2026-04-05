/**
 * TASK 5: MERCH ENGINE
 * Generates merch campaign content tied to market data
 * Concepts: limited drops tied to data milestones, brand-aligned product lines
 */
const fs = require('fs-extra');
const path = require('path');
const { log } = require('../utils/logger');
const { generateContent } = require('../utils/ai');
const brand = require('../utils/brand');

const OUT_DIR = path.join(__dirname, '..', 'output', 'merch');

async function generateMerchContent(marketData) {
  await fs.ensureDir(OUT_DIR);
  const ts = new Date().toISOString().slice(0, 10);
  const lic = marketData.licenses || {};
  const sales = marketData.salesData || {};

  const prompt = `Generate merch campaign content for The Cannabis Review Board (TCRB).

Brand aesthetic: dark, editorial, data-forward, minimalist. Black/off-white/chartreuse accent (#C8FF00).
Feels like: financial report meets intelligence dossier meets underground publication.

Current market data for design concepts:
- ${lic.totalCount?.toLocaleString()} licenses issued in NY
- $${sales.cumulative ? (sales.cumulative / 1e9).toFixed(1) : '3.3'}B cumulative sales
- ${sales.yoyGrowth || 54.8}% YoY growth
- Average item price: $${sales.avgItemPrice || 31.29}

Generate a merch drop concept as JSON with these keys:
- dropName: name of the collection (data-themed, not gimmicky)
- tagline: one line, sharp
- products: array of 4 items, each with: name, description, pricePoint, designConcept
- socialCaption: Instagram announcement caption (3 lines, TCRB voice)
- limitedEdition: boolean + reasoning

Product types: heavyweight tee, hoodie, dad hat, tote bag.
Design direction: typographic, monospace, data as graphic element. No cannabis leaf imagery.
No markdown backticks. Raw JSON only.`;

  try {
    const raw = await generateContent(prompt, { maxTokens: 800 });
    const content = JSON.parse(raw.replace(/```json|```/g, '').trim());
    const outPath = path.join(OUT_DIR, `merch_drop_${ts}.json`);
    await fs.writeJson(outPath, { ...content, generatedAt: ts }, { spaces: 2 });
    log('MERCH', `Drop concept saved: ${outPath}`);
  } catch (err) {
    log('MERCH', `AI generation failed, writing fallback: ${err.message}`);
    const fallback = {
      dropName: 'SYSTEM OF RECORD — VOL.01',
      tagline: 'The data speaks. The merch documents.',
      products: [
        { name: 'SYSTEM TEE', description: 'Heavyweight black tee. TCRB wordmark front. Market data grid back.', pricePoint: '$48', designConcept: 'Monospace type, off-white on black, accent chartreuse on collar tag' },
        { name: 'DATA HOODIE', description: 'Oversized black hoodie. Ticker strip graphic across chest.', pricePoint: '$85', designConcept: 'Simulated data ticker across chest, minimal branding' },
        { name: 'SIGNAL CAP', description: 'Black dad hat. TCRB monogram.', pricePoint: '$35', designConcept: 'Embroidered TCRB in chartreuse on black, unstructured' },
        { name: 'RECORD TOTE', description: 'Heavy canvas tote. System of Record print.', pricePoint: '$28', designConcept: 'Black canvas, screen-printed data layout, utilitarian' },
      ],
      socialCaption: `SYSTEM OF RECORD — VOL.01\nThe first TCRB merch drop. Data-forward. Limited.\ntcrb.io/merch`,
      limitedEdition: true,
      generatedAt: ts,
    };
    await fs.writeJson(path.join(OUT_DIR, `merch_drop_${ts}.json`), fallback, { spaces: 2 });
  }
}

module.exports = { generateMerchContent };
