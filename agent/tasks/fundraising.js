/**
 * TASK 4: FUNDRAISING ENGINE
 * Generates Vineyard Foundation campaign content
 * Produces: campaign narratives, donation CTAs, impact reports
 */
const fs = require('fs-extra');
const path = require('path');
const { log } = require('../utils/logger');
const { generateContent } = require('../utils/ai');
const brand = require('../utils/brand');

const OUT_DIR = path.join(__dirname, '..', 'output', 'fundraising');

async function generateFundraisingContent(marketData) {
  await fs.ensureDir(OUT_DIR);
  const ts = new Date().toISOString().slice(0, 10);

  // Generate campaign narrative tied to market data
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
- Medical cannabis revenue declining 30% as adult-use grows

Generate THREE pieces of content:
1. CAMPAIGN POST (Instagram caption, 4-5 lines, data-informed, ties market reality to Foundation mission)
2. DONATION CTA (2 lines, direct, no fluff)
3. IMPACT STATEMENT (1 paragraph, what donations fund, reference specific programs)

Format as JSON with keys: campaignPost, donationCTA, impactStatement
No markdown backticks in response. Raw JSON only.`;

  try {
    const raw = await generateContent(prompt, { maxTokens: 600 });
    const content = JSON.parse(raw.replace(/```json|```/g, '').trim());
    const outPath = path.join(OUT_DIR, `campaign_${ts}.json`);
    await fs.writeJson(outPath, { ...content, generatedAt: ts, marketContext: { seePercent, dispensaries } }, { spaces: 2 });
    log('FUNDRAISING', `Campaign content saved: ${outPath}`);
  } catch (err) {
    log('FUNDRAISING', `AI generation failed, writing fallback: ${err.message}`);
    const fallback = {
      campaignPost: `${seePercent}% of New York cannabis licenses were awarded to equity applicants.\nThe legal challenge to that framework is now in federal court.\nThe Vineyard Foundation exists to ensure equity is not just a licensing metric.\nIt is a lived reality.\nSupport the work.`,
      donationCTA: `The Vineyard Foundation. Rebuilding the soil.\nContribute at thevineyardfoundation.org`,
      impactStatement: `Donations to The Vineyard Foundation fund direct programs: Still Waters (mental health support), the Autism Trust Seed Fund, Tail End Trust (pet care for impacted families), and Brick & Bloom (urban garden initiatives). Every dollar reinvests into communities impacted by prohibition.`,
      generatedAt: ts,
      marketContext: { seePercent, dispensaries },
    };
    await fs.writeJson(path.join(OUT_DIR, `campaign_${ts}.json`), fallback, { spaces: 2 });
  }
}

module.exports = { generateFundraisingContent };
