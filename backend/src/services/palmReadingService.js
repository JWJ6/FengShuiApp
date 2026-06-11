const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SUPPORTED_LANGUAGES = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  fr: 'Français',
};

const SCORING_RUBRIC = `
## Scoring Rubric (MUST follow strictly)
Score each life area by analyzing the palm lines, hand shape, finger proportions, and skin texture.

### Wealth & Finance (max 100)
- Clear, deep Money Line (财运线): +20
- Strong Sun Line (太阳线) indicating success: +15
- Well-defined Fate Line (命运线) showing career stability: +15
- Mount of Jupiter (木星丘) well-developed: +10
- No breaks or islands on Money Line: +10
- Clear Head Line indicating smart financial decisions: +10
- Good spacing between fingers (not too tight): +10
- Well-proportioned thumb showing discipline: +10

### Love & Relationships (max 100)
- Clear, deep Heart Line (感情线): +20
- Heart Line extends to Jupiter mount: +10
- No islands or chains on Heart Line: +15
- Marriage Lines clear and well-defined: +15
- Venus Mount (金星丘) well-developed: +15
- Warm skin tone and soft texture: +10
- Affection lines present: +10
- Girdle of Venus visible: +5

### Career & Success (max 100)
- Strong, unbroken Fate Line (事业线): +20
- Clear Head Line (智慧线) showing mental clarity: +15
- Sun Line present and well-defined: +15
- Mount of Saturn well-developed: +10
- Strong thumb indicating willpower: +15
- Leadership lines present: +10
- No breaks in Fate Line: +15

### Health & Vitality (max 100)
- Clear, long Life Line (生命线): +20
- No breaks or islands on Life Line: +15
- Health Line absent or clear (absence is good): +15
- Strong Venus Mount indicating vitality: +15
- Good skin color and elasticity: +10
- Nails healthy and well-shaped: +10
- Balanced hand proportions: +15

### Life Path & Destiny (max 100)
- Clear Fate Line from base to fingers: +20
- Strong Life Line indicating life force: +15
- Intuition Line present (Moon mount): +10
- Mystic Cross present in palm center: +15
- Well-balanced hand shape (Earth/Water/Fire/Air): +15
- Overall line clarity and depth: +15
- Ring of Solomon present: +10

### Overall Score = weighted average of all areas (round to nearest integer)

IMPORTANT: Apply this rubric consistently. For features not clearly visible, assume neutral (award 50% of those points). The same image should always produce scores within ±3 points.`;

const buildQuickPrompt = (language) => {
  const langName = SUPPORTED_LANGUAGES[language] || 'English';

  return `You are a renowned palm reading master (手相大师) with deep expertise in Chinese palmistry (手相学) and Western chiromancy.

Analyze the provided palm image to give a quick fortune overview.

Please respond entirely in ${langName}.

${SCORING_RUBRIC}

Return a JSON object with this exact structure:
{
  "overall_score": <number 1-100, calculated from rubric>,
  "overall_summary": "<2-3 sentence overview of this person's fortune and life trajectory based on their palm>",
  "areas": [
    {
      "name": "<area name>",
      "score": <number 1-100, calculated from rubric>,
      "brief": "<one sentence summary of this life area>"
    }
  ]
}

Rules:
- You MUST include exactly these 5 areas: Wealth & Finance, Love & Relationships, Career & Success, Health & Vitality, Life Path & Destiny
- Scores MUST follow the rubric above — check each criterion and sum the points
- Base your analysis on visible palm lines, hand shape, finger proportions, mounts, and skin texture
- Return ONLY valid JSON, no markdown or extra text`;
};

const buildDetailedPrompt = (language, quickResult) => {
  const langName = SUPPORTED_LANGUAGES[language] || 'English';

  return `You are a legendary palm reading grandmaster (手相宗师) with 40+ years of experience, deeply versed in Chinese palmistry (手相学), Western chiromancy, the Five Elements (五行), and I Ching divination.

Please respond entirely in ${langName}.

A quick analysis has already been completed with these results (YOU MUST USE THESE EXACT SCORES — do not change them):
${JSON.stringify(quickResult, null, 2)}

Now provide the full detailed analysis. Return a JSON object with this exact structure:
{
  "overall_score": ${quickResult.overall_score},
  "overall_summary": "${quickResult.overall_summary}",
  "areas": [
    {
      "name": "<must match the area names from quick analysis>",
      "score": <must match the score from quick analysis>,
      "issues": [
        {
          "description": "<detailed observation about palm lines, hand shape, or mount features related to this area, ~50 words>",
          "impact": "<how this affects the person's fortune, opportunities, and life trajectory in this area, ~60 words>",
          "severity": "<high/medium/low>",
          "solution": "<specific actionable advice: feng shui remedies, lucky colors, auspicious directions, lifestyle changes, gemstones, ~80 words>"
        }
      ],
      "positives": ["<positive reading about this area based on observed palm features, ~40 words each>"]
    }
  ],
  "general_tips": ["<holistic life advice based on the overall palm reading, ~50 words each>"]
}

Important rules:
- Use the EXACT same area names and scores from the quick analysis — do NOT change any scores
- Each area MUST have 2-3 detailed observations (issues) with solutions AND 2+ positive readings
- Reference specific palm lines (Life Line, Heart Line, Head Line, Fate Line, Sun Line, Money Line, Marriage Lines, etc.)
- Reference hand features (mounts, finger shape, thumb strength, skin texture, nail condition)
- Mention Five Elements associations, lucky numbers, colors, and directions
- Provide 5+ general tips covering wealth enhancement, relationship harmony, career growth, health maintenance, and spiritual development
- Be encouraging but honest — frame challenges as opportunities for growth
- Return ONLY valid JSON, no markdown or extra text`;
};

const MIME_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
  heif: 'image/heif',
  webp: 'image/webp',
};

const readImageContents = (imagePaths) => {
  return imagePaths.map((imgPath) => {
    const absolutePath = path.resolve(imgPath);
    const imageData = fs.readFileSync(absolutePath);
    const base64 = imageData.toString('base64');
    const ext = path.extname(imgPath).toLowerCase().replace('.', '');
    const mediaType = MIME_TYPES[ext] || 'image/jpeg';

    return {
      type: 'image',
      source: {
        type: 'base64',
        media_type: mediaType,
        data: base64,
      },
    };
  });
};

const parseJsonResponse = (text, label) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to extract JSON from ${label} response`);
  }
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error(`Failed to parse ${label} JSON: ${e.message}`);
  }
};

// Phase 1: Quick overview (uses Haiku for speed)
const analyzeQuick = async (imagePaths, language = 'en') => {
  const imageContents = readImageContents(imagePaths);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: [
          ...imageContents,
          { type: 'text', text: buildQuickPrompt(language) },
        ],
      },
    ],
  });

  return parseJsonResponse(response.content[0].text, 'quick palm analysis');
};

// Phase 2: Detailed analysis (uses Sonnet)
const analyzeDetailed = async (imagePaths, language = 'en', quickResult) => {
  const imageContents = readImageContents(imagePaths);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: [
          ...imageContents,
          { type: 'text', text: buildDetailedPrompt(language, quickResult) },
        ],
      },
    ],
  });

  return parseJsonResponse(response.content[0].text, 'detailed palm analysis');
};

module.exports = { analyzeQuick, analyzeDetailed };
