/**
 * generateAdConcept.js
 * Uses NVIDIA API (MiniMax M2.5) to produce a vintage luxury ad concept JSON.
 * Replaces Gemini 1.5 Flash due to expired API key.
 */

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_MODEL = 'minimaxai/minimax-m2.5';

async function generateAdConcept(cleanedTranscript) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error('NVIDIA_API_KEY is not set.');

  const systemPrompt = `You are a vintage luxury advertising creative director.

Your job is to generate print ad concepts — copy and art direction —
that follow the visual and tonal grammar of 1970s–1980s European and
American luxury print advertising.

COPY PHILOSOPHY
- Never persuade. Self-select.
- Write from authority, not aspiration.
- Heritage over hype.
- One idea per ad.
- No exclamation marks.
- No calls to action.

Taglines must follow:
1. Conditional
2. Declarative
3. Prestige claim

VISUAL DIRECTION
Each concept must specify:
MOOD
SETTING
PROPS
HUMAN PRESENCE
PRODUCT PLACEMENT
PALETTE

WHAT TO AVOID
- bright digital lighting
- smiling faces
- urgent marketing language
- words like premium, exclusive, innovative
- product features as copy

OUTPUT FORMAT
Return ONLY valid JSON:
{
  "headline": "",
  "tagline": "",
  "art_direction": "",
  "tone_note": "",
  "palette": "",
  "mood": ""
}`;

  const response = await fetch(NVIDIA_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Generate a vintage luxury ad concept based on this text:\n\n${cleanedTranscript}`,
        },
      ],
      temperature: 0.8,
      top_p: 0.95,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`NVIDIA Concept API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  let rawText = data?.choices?.[0]?.message?.content?.trim();

  if (!rawText) throw new Error('No ad concept returned from NVIDIA.');

  const parseJson = (text) => {
    try {
      // 1. Try direct parse
      return JSON.parse(text);
    } catch {
      // 2. Try to find the first '{' and last '}'
      const firstCurly = text.indexOf('{');
      const lastCurly = text.lastIndexOf('}');
      if (firstCurly !== -1 && lastCurly !== -1 && lastCurly > firstCurly) {
        const potentialJson = text.substring(firstCurly, lastCurly + 1);
        try {
          return JSON.parse(potentialJson);
        } catch {
          // 3. Last ditch: remove potential markdown fences and try again
          const cleaned = potentialJson
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
          try {
            return JSON.parse(cleaned);
          } catch {
            return null;
          }
        }
      }
      return null;
    }
  };

  const adConcept = parseJson(rawText);
  if (adConcept) return adConcept;

  console.error('--- RAW NVIDIA CONCEPT RESPONSE ---');
  console.error(rawText);
  console.error('-----------------------------------');
  throw new Error('Failed to parse ad concept JSON from NVIDIA response. The raw output has been logged to the server console.');
}

module.exports = generateAdConcept;
