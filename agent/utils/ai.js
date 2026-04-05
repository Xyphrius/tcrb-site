/**
 * TCRB AI Content Generator — Anthropic Claude API
 */
const fetch = require('node-fetch');
const brand = require('./brand');

const API_URL = 'https://api.anthropic.com/v1/messages';

async function generateContent(prompt, options = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const systemPrompt = `You are the content engine for The Cannabis Review Board (TCRB).
Voice: ${brand.tone.voice}
Style: ${brand.tone.style}
Never use: ${brand.tone.avoid.join(', ')}
Format: ${options.format || 'text'}
${options.context || ''}`;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: options.model || 'claude-sonnet-4-20250514',
      max_tokens: options.maxTokens || 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

module.exports = { generateContent };
