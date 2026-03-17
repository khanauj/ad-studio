/**
 * cleanTranscript.js
 * Uses NVIDIA API (MiniMax M2.5) to clean a raw YouTube transcript.
 */

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_MODEL = 'minimaxai/minimax-m2.5';

async function cleanTranscript(rawTranscript) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error('NVIDIA_API_KEY is not set.');

  const response = await fetch(NVIDIA_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        {
          role: 'user',
          content: `You are a transcript cleaning assistant.

Clean the following YouTube transcript by:
- removing filler words (um, uh, you know)
- fixing grammar
- removing repetition
- keeping the meaning the same
- making it readable

Return only the cleaned text.

Input:
${rawTranscript}`,
        },
      ],
      temperature: 0.3,
      top_p: 0.95,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`NVIDIA API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const cleaned = data?.choices?.[0]?.message?.content?.trim();
  if (!cleaned) throw new Error('No cleaned transcript returned from NVIDIA API.');
  return cleaned;
}

module.exports = cleanTranscript;


module.exports = cleanTranscript;
