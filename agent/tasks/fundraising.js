/**
 * TASK 4: FUNDRAISING ENGINE
 * Generates Vineyard Foundation campaign content
 * ALL content stages to review queue — nothing posts without approval
 */
const fs = require('fs-extra');
const path = require('path');
const { log } = require('../utils/logger');
const { generateContent } = require('../utils/ai');
const brand = require('../utils/brand');
const { stageForReview } = require('./review-queue');

const OUT_DIR = path.join(__dirname, '..', 'output', 'fundraising');

async function generateFundraisingContent(marketData) {
  await fs.ensureDir(OUT_DIR);
  const ts = new Date().toISOString().slice(0, 10);
  const seePercent = marketData.licenses?.seePercentage || 57;
  const dispensaries = marketData.dispensaries?.openCount || 623;

  const prompt = `Generate a fundraising campaign post for The Vineyard Foundation, the nonprofit arm of TCRB.
Foundation mission: ${brand.vineyard.tagline}
Pillars: ${brand.vineyard.pillars.join(', ')}
Programs: ${brand.vineyard.programs.join(', ')}
Current market context:
- ${seePercent}% of NY cannabis licenses went to equity applicants
- ${dispensaries} dispensaries now open statewide
- The equity licensing framework is under federal legal challenge
Generate THREE pieces as JSON (no markdown backticks):
{"campaignPost":"...","donationCTA":"...","impactStatement":"..."}`;

  let content;
  try {
    const raw = await generateContent(prompt, { maxTokens: 600 });
    content = JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch (err) {
    log('FUNDRAISING', `AI fallback: ${err.message}`);
    content = {
      campaignPost: `${seePercent}% of New York cannabis licenses were awarded to equity applicants.\nThe legal challenge to that framework is now in federal court.\nThe Vineyard Foundation exists to ensure equity is not just a licensing metric.\nIt is a lived reality.\nSupport the work.`,
      donationCTA: `The Vineyard Foundation. Rebuilding the soil.\nContribute at thevineyardfoundation.org`,
      impactStatement: `Donations fund direct programs: Still Waters (mental health), Autism Trust Seed Fund, Tail End Trust (pet care), and Brick & Bloom (urban gardens). Every dollar reinvests into communities impacted by prohibition.`,
    };
  }

  // Save locally
  await fs.writeJson(path.join(OUT_DIR, `campaign_${ts}.json`), { ...content, generatedAt: ts }, { spaces: 2 });

  // Stage each piece for review
  await stageForReview('fundraising', {
    title: `Vineyard Foundation — Campaign Post`,
    caption: content.campaignPost,
    category: 'campaign_post',
    data: { seePercent, dispensaries, ts },
  });

  await stageForReview('fundraising', {
    title: `Vineyard Foundation — Donation CTA`,
    caption: content.donationCTA,
    category: 'donation_cta',
    data: { ts },
  });

  await stageForReview('fundraising', {
    title: `Vineyard Foundation — Impact Statement`,
    caption: content.impactStatement,
    category: 'impact_statement',
    data: { ts },
  });

  log('FUNDRAISING', `3 items staged for review`);
}

module.exports = { generateFundraisingContent };
