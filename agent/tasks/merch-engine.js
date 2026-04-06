/**
 * TASK 5: MERCH ENGINE
 * Generates merch campaign content tied to market data
 * ALL content stages to review queue — nothing posts without approval
 */
const fs = require('fs-extra');
const path = require('path');
const { log } = require('../utils/logger');
const { generateContent } = require('../utils/ai');
const brand = require('../utils/brand');
const { stageForReview } = require('./review-queue');

const OUT_DIR = path.join(__dirname, '..', 'output', 'merch');

async function generateMerchContent(marketData) {
  await fs.ensureDir(OUT_DIR);
  const ts = new Date().toISOString().slice(0, 10);
  const lic = marketData.licenses || {};
  const sales = marketData.salesData || {};

  const prompt = `Generate a merch drop concept for TCRB as JSON (no backticks):
{"dropName":"...","tagline":"...","products":[{"name":"...","description":"...","pricePoint":"...","designConcept":"..."}],"socialCaption":"...","limitedEdition":true}
Brand: dark, editorial, data-forward. Black/off-white/chartreuse. No cannabis leaf imagery.
Data for concepts: ${lic.totalCount?.toLocaleString()} licenses, $${sales.cumulative ? (sales.cumulative / 1e9).toFixed(1) : '3.3'}B sales.
4 products: heavyweight tee, hoodie, dad hat, tote bag. Typographic, monospace designs.`;

  let content;
  try {
    const raw = await generateContent(prompt, { maxTokens: 800 });
    content = JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch (err) {
    log('MERCH', `AI fallback: ${err.message}`);
    content = {
      dropName: 'SYSTEM OF RECORD — VOL.01',
      tagline: 'The data speaks. The merch documents.',
      products: [
        { name: 'SYSTEM TEE', description: 'Heavyweight black tee. TCRB wordmark front.', pricePoint: '$48', designConcept: 'Monospace type, off-white on black' },
        { name: 'DATA HOODIE', description: 'Oversized black hoodie. Ticker strip graphic.', pricePoint: '$85', designConcept: 'Simulated data ticker across chest' },
        { name: 'SIGNAL CAP', description: 'Black dad hat. TCRB monogram.', pricePoint: '$35', designConcept: 'Embroidered TCRB in chartreuse' },
        { name: 'RECORD TOTE', description: 'Heavy canvas tote.', pricePoint: '$28', designConcept: 'Screen-printed data layout' },
      ],
      socialCaption: `SYSTEM OF RECORD — VOL.01\nThe first TCRB merch drop. Data-forward. Limited.\ntcrb.io/merch`,
      limitedEdition: true,
    };
  }

  // Save locally
  await fs.writeJson(path.join(OUT_DIR, `merch_drop_${ts}.json`), { ...content, generatedAt: ts }, { spaces: 2 });

  // Stage for review
  await stageForReview('merch', {
    title: `Merch Drop: ${content.dropName}`,
    caption: content.socialCaption,
    category: 'merch_drop',
    data: {
      dropName: content.dropName,
      tagline: content.tagline,
      products: content.products,
      limitedEdition: content.limitedEdition,
      ts,
    },
  });

  // Stage each product individually for review
  for (const product of content.products) {
    await stageForReview('merch', {
      title: `Product: ${product.name}`,
      caption: `${product.name}\n${product.description}\n${product.pricePoint}\nDesign: ${product.designConcept}`,
      category: 'merch_product',
      data: product,
    });
  }

  log('MERCH', `${1 + content.products.length} items staged for review`);
}

module.exports = { generateMerchContent };
