// ============================================================================
// Custom Template Generator — AI-powered template design configuration
// ============================================================================
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/index.js';
import { buildCustomTemplatePrompt } from './prompts.js';
import { ServiceError } from '../../types/index.js';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const VALID_FONTS = new Set([
  "'Inter', sans-serif",
  "'Outfit', sans-serif",
  "'JetBrains Mono', monospace",
  "'Playfair Display', serif",
  "'DM Sans', sans-serif",
  "'Space Grotesk', sans-serif",
  "'Syne', sans-serif",
  "'EB Garamond', serif",
]);

const VALID_SHADOW = new Set(['none', 'subtle', 'medium', 'strong']);

/**
 * Validate and sanitize the AI-generated template config.
 */
function sanitizeConfig(parsed) {
  const isHex = (s) => /^#[0-9A-Fa-f]{3,8}$/.test(s);
  const fallbackHex = (val, fallback) => (typeof val === 'string' && isHex(val) ? val : fallback);

  const colors = {
    primary: fallbackHex(parsed.colors?.primary, '#18181B'),
    secondary: fallbackHex(parsed.colors?.secondary, '#71717A'),
    accent: fallbackHex(parsed.colors?.accent, '#7C3AED'),
    background: fallbackHex(parsed.colors?.background, '#FAFAFA'),
    surface: fallbackHex(parsed.colors?.surface, '#FFFFFF'),
    text: fallbackHex(parsed.colors?.text, '#18181B'),
    textSecondary: fallbackHex(parsed.colors?.textSecondary, '#71717A'),
    border: fallbackHex(parsed.colors?.border, '#E4E4E7'),
  };

  const typography = {
    headingFont: VALID_FONTS.has(parsed.typography?.headingFont) ? parsed.typography.headingFont : "'Inter', sans-serif",
    bodyFont: VALID_FONTS.has(parsed.typography?.bodyFont) ? parsed.typography.bodyFont : "'Inter', sans-serif",
    headingWeight: [300, 400, 500, 600, 700, 800].includes(parsed.typography?.headingWeight) ? parsed.typography.headingWeight : 700,
    bodyWeight: [300, 400, 500].includes(parsed.typography?.bodyWeight) ? parsed.typography.bodyWeight : 400,
    baseSize: typeof parsed.typography?.baseSize === 'number' ? Math.max(12, Math.min(20, parsed.typography.baseSize)) : 16,
    lineHeight: typeof parsed.typography?.lineHeight === 'number' ? Math.max(1.2, Math.min(2, parsed.typography.lineHeight)) : 1.6,
    letterSpacing: typeof parsed.typography?.letterSpacing === 'number' ? Math.max(-0.05, Math.min(0.1, parsed.typography.letterSpacing)) : 0,
  };

  const spacing = {
    sectionPadding: typeof parsed.spacing?.sectionPadding === 'number' ? Math.max(32, Math.min(120, parsed.spacing.sectionPadding)) : 64,
    contentMaxWidth: typeof parsed.spacing?.contentMaxWidth === 'number' ? Math.max(800, Math.min(1400, parsed.spacing.contentMaxWidth)) : 1060,
    cardGap: typeof parsed.spacing?.cardGap === 'number' ? Math.max(8, Math.min(48, parsed.spacing.cardGap)) : 24,
  };

  const borderShadow = {
    borderRadius: typeof parsed.borderShadow?.borderRadius === 'number' ? Math.max(0, Math.min(32, parsed.borderShadow.borderRadius)) : 12,
    borderWidth: typeof parsed.borderShadow?.borderWidth === 'number' ? Math.max(0, Math.min(4, parsed.borderShadow.borderWidth)) : 1,
    shadowIntensity: VALID_SHADOW.has(parsed.borderShadow?.shadowIntensity) ? parsed.borderShadow.shadowIntensity : 'medium',
  };

  return {
    colors,
    typography,
    spacing,
    borderShadow,
    suggestedSections: Array.isArray(parsed.suggestedSections) ? parsed.suggestedSections : ['hero', 'about', 'skills', 'projects', 'experience', 'education', 'contact'],
    designNotes: typeof parsed.designNotes === 'string' ? parsed.designNotes : '',
  };
}

/**
 * Generate a custom template configuration from a user prompt.
 */
export async function generateCustomTemplate(userPrompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.8,
        topP: 0.9,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });

    const prompt = buildCustomTemplatePrompt(userPrompt);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) {
      throw new ServiceError('AI returned an empty response', 500);
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new ServiceError('AI returned invalid JSON for template config', 500);
    }

    return sanitizeConfig(parsed);
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('SAFETY')) {
      throw new ServiceError('Template generation was blocked by safety filters.', 422);
    }
    if (message.includes('quota') || message.includes('rate')) {
      throw new ServiceError('AI service rate limit reached. Please try again in a moment.', 429);
    }
    throw new ServiceError(`Failed to generate custom template: ${message}`, 500);
  }
}
