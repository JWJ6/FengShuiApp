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

// Structured scoring rubric for consistent results
const SCORING_RUBRIC = `
## Scoring Rubric (MUST follow strictly)
Score each area by checking these criteria. Each criterion is worth points:

### Door/Entrance (max 100)
- Main door faces auspicious direction: +20
- No direct alignment with back door/window (穿堂煞): +15
- Clear, uncluttered entryway: +15
- Proper lighting at entrance: +10
- No sharp corners pointing at door (尖角煞): +10
- Door size proportional to house: +10
- No stairs directly facing door: +10
- Good condition, no damage: +10

### Living Room (max 100)
- Sofa has solid wall behind (靠山): +15
- No beam above seating area (横梁压顶): +15
- Good natural light and ventilation: +15
- Regular room shape, no missing corners: +10
- TV/mirror not directly facing sofa: +10
- Plants or water features in correct position: +10
- Color harmony with Five Elements: +10
- Furniture arrangement allows smooth qi flow: +15

### Bedroom (max 100)
- Bed has solid wall behind headboard: +15
- Bed not directly facing door: +15
- No mirror facing the bed: +15
- No beam above the bed: +10
- Balanced bedside tables on both sides: +10
- No electronics near bed: +10
- Soft, warm lighting: +10
- Good air circulation without direct draft: +15

### Kitchen (max 100)
- Stove not facing door directly: +15
- Stove and sink not directly opposite (水火相冲): +20
- Good ventilation: +15
- Clean and well-organized: +10
- Stove not under beam: +10
- Kitchen not in center of house: +10
- Proper lighting: +10
- Stove not facing toilet wall: +10

### Bathroom (max 100)
- Door kept closed: +15
- Good ventilation: +20
- Not in center of house: +15
- Toilet not visible from entrance: +15
- Clean and dry: +10
- Proper lighting: +10
- Not directly above kitchen/bedroom: +15

### Overall Score = weighted average of all identified areas (round to nearest integer)

IMPORTANT: Apply this rubric consistently. For items not visible in the image, assume neutral (award 50% of those points). The same image should always produce scores within ±3 points.`;

const buildQuickPrompt = (language) => {
  const langName = SUPPORTED_LANGUAGES[language] || '中文';

  return `You are a Feng Shui master. Analyze this image and provide a quick overview assessment.

Please respond entirely in ${langName}.

${SCORING_RUBRIC}

Return a JSON object with this exact structure:
{
  "overall_score": <number 1-100, calculated from rubric>,
  "overall_summary": "<2-3 sentence overview of the space's feng shui energy>",
  "areas": [
    {
      "name": "<area name>",
      "score": <number 1-100, calculated from rubric>,
      "brief": "<one sentence summary of this area's feng shui>"
    }
  ]
}

Rules:
- Identify 3-6 areas visible in the image
- Scores MUST follow the rubric above — check each criterion and sum the points
- Return ONLY valid JSON, no markdown or extra text`;
};

const buildDetailedPrompt = (language, quickResult) => {
  const langName = SUPPORTED_LANGUAGES[language] || '中文';

  return `You are a renowned Feng Shui grandmaster with 40+ years of experience, deeply versed in Form School (形势派), Compass School (理气派), Flying Stars (玄空飞星), Eight Mansions (八宅), and the Five Elements (五行).

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
          "description": "<detailed description of the feng shui issue, ~50 words>",
          "impact": "<how this affects health/wealth/career/relationships, ~60 words>",
          "severity": "<high/medium/low>",
          "solution": "<specific actionable solution with placement directions, items, colors, ~80 words>"
        }
      ],
      "positives": ["<positive aspect, ~40 words each>"]
    }
  ],
  "general_tips": ["<improvement suggestion, ~50 words each>"]
}

Important rules:
- Use the EXACT same area names and scores from the quick analysis — do NOT change any scores
- Each area MUST have 2-3 issues with detailed solutions AND 2+ positive aspects
- Be specific: mention compass directions, feng shui cure items, colors, materials
- Reference classical feng shui principles
- Provide 5+ general tips covering wealth, health, relationships, career, spiritual wellbeing
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

// Phase 1: Quick overview (uses Haiku for speed, ~3-5 seconds)
const analyzeQuick = async (imagePaths, language = 'zh') => {
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

  return parseJsonResponse(response.content[0].text, 'quick analysis');
};

// Phase 2: Detailed analysis (uses Sonnet, passes quick scores to ensure consistency)
const analyzeDetailed = async (imagePaths, language = 'zh', quickResult) => {
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

  return parseJsonResponse(response.content[0].text, 'detailed analysis');
};

module.exports = { analyzeQuick, analyzeDetailed };
