// ============================================================================
// Portfolio Validators — Zod 4 schemas
// ============================================================================
import { z } from 'zod';
import { getAllTemplateIds } from '../shared/template-registry.js';

const SECTION_TYPES = [
    'hero',
    'about',
    'skills',
    'experience',
    'projects',
    'education',
    'certifications',
    'contact',
    'github-stats',
    'tech-stack',
    'case-studies',
    'gallery',
    'services',
    'testimonials',
    'publications',
    'timeline',
    'media-showcase',
    'social-proof',
];
const TEMPLATE_IDS = getAllTemplateIds();
const animationSchema = z.object({
    type: z.enum(['fade', 'rise', 'drop', 'slide', 'slideLeft', 'slideRight', 'scale', 'zoomBlur', 'flip', 'tilt', 'clip', 'blur', 'none']),
    duration: z.number().optional(),
    delay: z.number().optional(),
    distance: z.number().optional(),
    easing: z.enum(['smooth', 'spring', 'snappy', 'luxury']).optional(),
    repeatOnScroll: z.boolean().optional(),
});
export const createPortfolioSchema = z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
});
export const uploadResumeSchema = z.object({
    portfolioId: z.string().min(1, 'Portfolio ID is required'),
});
export const enrichGitHubSchema = z.object({
    portfolioId: z.string().min(1, 'Portfolio ID is required'),
    githubUrl: z.string().min(1, 'GitHub URL is required').refine((val) => {
        // Accept full URLs or just usernames
        return /^(https?:\/\/(www\.)?github\.com\/)?[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(val);
    }, { message: 'Invalid GitHub URL or username' }),
});
export const generatePortfolioSchema = z.object({
    portfolioId: z.string().min(1, 'Portfolio ID is required'),
    templateId: z.enum(TEMPLATE_IDS).optional(),
});
export const updatePortfolioSchema = z.object({
    generatedContent: z.record(z.string(), z.unknown()).optional(),
    designSettings: z.record(z.string(), z.unknown()).optional(),
    sections: z
        .array(z.object({
        id: z.string(),
        type: z.enum(SECTION_TYPES),
        title: z.string(),
        visible: z.boolean(),
        order: z.number(),
        animation: animationSchema,
    }))
        .optional(),
    selectedTemplate: z.enum(TEMPLATE_IDS).optional(),
    themeMode: z.enum(['light', 'dark', 'auto']).optional(),
    profileImageUrl: z.string().optional(),
    linkedinData: z
        .object({
        url: z.string(),
        headline: z.string().optional(),
        summary: z.string().optional(),
    })
        .optional(),
});
export const updateSectionsSchema = z.object({
    sections: z.array(z.object({
        id: z.string(),
        type: z.enum(SECTION_TYPES),
        title: z.string(),
        visible: z.boolean(),
        order: z.number(),
        animation: animationSchema,
    })),
});
