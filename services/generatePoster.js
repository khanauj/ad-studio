/**
 * generatePoster.js
 * Uses NVIDIA API (usdcode-llama-3.1-70b) to generate poster HTML,
 * then converts it to PNG via node-html-to-image.
 */

const nodeHtmlToImage = require('node-html-to-image');
const path = require('path');
const fs = require('fs');

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_MODEL = 'nvidia/usdcode-llama-3.1-70b-instruct';

/**
 * Fallback HTML builder in case AI generation fails.
 */
function fallbackHtml(concept) {
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1080px;background:#F5F0E8;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;position:relative;overflow:hidden}
body::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 50%,rgba(44,24,16,0.25) 100%);pointer-events:none;z-index:2}
.poster{width:860px;text-align:center;z-index:1;padding:60px 40px}
.line{height:1px;background:#C4A882;margin:0 auto 48px;width:60%}
.headline{font-family:'Playfair Display',serif;font-size:52px;font-weight:700;color:#2C1810;line-height:1.15;text-transform:uppercase;margin-bottom:28px;letter-spacing:1px}
.divider{width:80px;height:2px;background:#8B4513;margin:0 auto 28px}
.tagline{font-size:22px;font-weight:300;font-style:italic;color:#6B5B4F;line-height:1.5;margin-bottom:40px}
.scene{font-size:15px;font-weight:300;color:#6B5B4F;line-height:1.8;max-width:600px;margin:0 auto;opacity:0.8}
.mood{display:inline-block;margin-top:36px;padding:8px 28px;border:1px solid #C4A882;font-size:11px;text-transform:uppercase;letter-spacing:4px;color:#6B5B4F}
</style></head><body>
<div class="poster">
  <div class="line"></div>
  <div class="headline">${esc(concept.headline)}</div>
  <div class="divider"></div>
  <div class="tagline">${esc(concept.tagline)}</div>
  <div class="scene">${esc(concept.art_direction)}</div>
  <div class="mood">${esc(concept.mood)}</div>
</div>
</body></html>`;
}

/**
 * Use NVIDIA API to generate creative poster HTML from the ad concept.
 */
async function generateHtmlWithAI(concept) {
  const apiKey = process.env.NVIDIA_HTML_API_KEY;
  if (!apiKey) {
    console.log('   NVIDIA_HTML_API_KEY not set, using fallback template.');
    return fallbackHtml(concept);
  }

  const prompt = `Generate a complete, self-contained HTML page for a 1080x1080 pixel vintage luxury print advertisement poster.

AD CONCEPT:
- Headline: ${concept.headline || 'Untitled'}
- Tagline: ${concept.tagline || ''}
- Art Direction: ${concept.art_direction || ''}
- Mood: ${concept.mood || ''}
- Palette: ${concept.palette || 'warm ivory, burnt sienna, deep burgundy'}

DESIGN REQUIREMENTS:
- Exactly 1080px wide and 1080px tall (set on the body element)
- 1970s luxury magazine advertisement aesthetic
- Use Google Fonts: Playfair Display for headline, Cormorant Garamond for body text
- Warm analog color palette (ivory, sienna, burgundy, bronze tones)
- Film grain effect using CSS
- Vignette overlay using radial-gradient
- Centered headline in uppercase, tagline in italic below
- Art direction text as a subtle scene description
- Mood displayed as a small label
- Ornamental dividers (simple CSS lines or diamond shapes)
- NO images, NO JavaScript, only HTML and CSS
- All styles must be inline or in a <style> tag

Return ONLY the complete HTML code, starting with <!DOCTYPE html> and ending with </html>. No explanation, no markdown fences.`;

  try {
    const response = await fetch(NVIDIA_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        top_p: 1,
        max_tokens: 4096,
        extra_body: { expert_type: 'auto' },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.log(`   NVIDIA HTML API error (${response.status}), using fallback. ${errBody}`);
      return fallbackHtml(concept);
    }

    const data = await response.json();
    let html = data?.choices?.[0]?.message?.content?.trim();

    if (!html) {
      console.log('   No HTML returned from NVIDIA, using fallback.');
      return fallbackHtml(concept);
    }

    // Strip markdown fences if present
    html = html.replace(/^```html?\s*/i, '').replace(/```\s*$/i, '').trim();

    // Validate it looks like HTML
    if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
      console.log('   NVIDIA response is not valid HTML, using fallback.');
      return fallbackHtml(concept);
    }

    return html;
  } catch (err) {
    console.log(`   NVIDIA HTML generation failed: ${err.message}, using fallback.`);
    return fallbackHtml(concept);
  }
}

async function generatePoster(adConcept) {
  const generatedDir = path.join(__dirname, '..', 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  const filename = `ad_${Date.now()}.png`;
  const outputPath = path.join(generatedDir, filename);

  console.log('   Generating poster HTML with AI...');
  const html = await generateHtmlWithAI(adConcept);

  await nodeHtmlToImage({
    output: outputPath,
    html,
    type: 'png',
    puppeteerArgs: {
      defaultViewport: { width: 1080, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  return `/generated/${filename}`;
}

module.exports = generatePoster;
