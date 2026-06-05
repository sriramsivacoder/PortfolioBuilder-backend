// ============================================================================
// AI Generator Service — Generate portfolio content using Gemini
// ============================================================================
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/index.js';
import { buildGenerationPrompt } from './prompts.js';
import { ServiceError } from '../../types/index.js';
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
/**
 * Generate structured portfolio content from user data using Gemini AI.
 */
export async function generatePortfolioContent(profileData, githubData, linkedinData) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 16384,
                responseMimeType: 'application/json',
            },
        });
        const prompt = buildGenerationPrompt(profileData, githubData, linkedinData);
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        if (!text) {
            throw new ServiceError('AI returned an empty response', 500);
        }
        // Parse the JSON response
        let parsed;
        try {
            parsed = JSON.parse(text);
        }
        catch {
            throw new ServiceError('AI returned invalid JSON. Please try generating again.', 500);
        }
        // Validate required structure
        if (!parsed.hero || !parsed.about) {
            throw new ServiceError('AI response missing required sections (hero, about)', 500);
        }
        if (!parsed.hero.title || !parsed.hero.subtitle) {
            throw new ServiceError('AI response missing hero title or subtitle', 500);
        }
        if (!parsed.about.heading || !Array.isArray(parsed.about.paragraphs)) {
            throw new ServiceError('AI response missing about heading or paragraphs', 500);
        }
        // Ensure all arrays exist
        const content = {
            hero: {
                title: parsed.hero.title,
                subtitle: parsed.hero.subtitle,
                tagline: parsed.hero.tagline ?? undefined,
                ctaText: parsed.hero.ctaText ?? 'View My Work',
                ctaUrl: parsed.hero.ctaUrl ?? '#projects',
                backgroundStyle: parsed.hero.backgroundStyle ?? 'gradient',
            },
            about: {
                heading: parsed.about.heading,
                paragraphs: parsed.about.paragraphs,
                highlights: parsed.about.highlights ?? [],
                imageUrl: parsed.about.imageUrl ?? undefined,
            },
            skills: Array.isArray(parsed.skills) ? parsed.skills : profileData.skills ?? [],
            projects: Array.isArray(parsed.projects) ? parsed.projects : profileData.projects ?? [],
            experience: Array.isArray(parsed.experience) ? parsed.experience : profileData.experience ?? [],
            education: Array.isArray(parsed.education) ? parsed.education : profileData.education ?? [],
            certifications: Array.isArray(parsed.certifications) ? parsed.certifications : profileData.certifications ?? [],
            contact: parsed.contact ?? profileData.contact ?? {},
        };
        return content;
    }
    catch (error) {
        if (error instanceof ServiceError) {
            throw error;
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        // Handle specific Gemini API errors
        if (message.includes('SAFETY')) {
            throw new ServiceError('Content generation was blocked by safety filters. Please review your resume content.', 422);
        }
        if (message.includes('quota') || message.includes('rate')) {
            throw new ServiceError('AI service rate limit reached. Please try again in a moment.', 429);
        }
        throw new ServiceError(`Failed to generate portfolio content: ${message}`, 500);
    }
}
