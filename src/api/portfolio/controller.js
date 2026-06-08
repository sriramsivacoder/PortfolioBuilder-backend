// ============================================================================
// Portfolio Controller — HTTP handlers for portfolio endpoints
// ============================================================================
import { getParam } from '../../utils/params.js';
import * as portfolioService from '../../services/portfolio/index.js';
import { generateCustomTemplate as generateCustomTemplateService } from '../../services/custom-template-generator/index.js';
import { createPortfolioSchema, enrichGitHubSchema, generatePortfolioSchema, updatePortfolioSchema, updateSectionsSchema, } from '../../validators/portfolio.validator.js';
/**
 * POST /api/portfolio/create
 */
export async function createPortfolio(req, res, next) {
    try {
        const sessionId = req.sessionId;
        createPortfolioSchema.parse({ sessionId });
        const portfolio = await portfolioService.createPortfolio(sessionId);
        const response = {
            success: true,
            data: {
                portfolioId: portfolio._id.toString(),
                sessionId: portfolio.sessionId,
            },
            message: 'Portfolio created successfully',
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/portfolio/upload-resume
 */
export async function uploadResume(req, res, next) {
    try {
        const { portfolioId } = req.body;
        if (!portfolioId) {
            res.status(400).json({ success: false, error: 'portfolioId is required' });
            return;
        }
        const file = req.file;
        if (!file) {
            res.status(400).json({ success: false, error: 'Resume file is required' });
            return;
        }
        const resumeData = await portfolioService.uploadResume(portfolioId, file.buffer, file.mimetype);
        const response = {
            success: true,
            data: resumeData,
            portfolioId,
            message: 'Resume parsed successfully',
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/portfolio/enrich-github
 */
export async function enrichGitHub(req, res, next) {
    try {
        const validated = enrichGitHubSchema.parse(req.body);
        const githubData = await portfolioService.enrichWithGitHub(validated.portfolioId, validated.githubUrl);
        const response = {
            success: true,
            data: githubData,
            message: 'GitHub profile fetched successfully',
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/portfolio/generate
 */
export async function generatePortfolio(req, res, next) {
    try {
        const validated = generatePortfolioSchema.parse(req.body);
        const result = await portfolioService.generateContent(validated.portfolioId, validated.templateId);
        const response = {
            success: true,
            data: result,
            message: 'Portfolio content generated successfully',
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/portfolio/:id
 */
export async function getPortfolio(req, res, next) {
    try {
        const id = getParam(req.params.id);
        const portfolio = await portfolioService.getPortfolio(id);
        const response = {
            success: true,
            data: portfolio.toObject(),
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * PUT /api/portfolio/:id
 */
export async function updatePortfolio(req, res, next) {
    try {
        const id = getParam(req.params.id);
        const validated = updatePortfolioSchema.parse(req.body);
        const portfolio = await portfolioService.updatePortfolio(id, validated);
        const response = {
            success: true,
            data: portfolio.toObject(),
            message: 'Portfolio updated successfully',
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * PUT /api/portfolio/:id/sections
 */
export async function updateSections(req, res, next) {
    try {
        const id = getParam(req.params.id);
        const validated = updateSectionsSchema.parse(req.body);
        const portfolio = await portfolioService.updateSections(id, validated.sections);
        const response = {
            success: true,
            data: portfolio.toObject(),
            message: 'Sections updated successfully',
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/portfolio/:id/classify
 */
export async function classifyProfile(req, res, next) {
    try {
        const id = getParam(req.params.id);
        const result = await portfolioService.classifyPortfolioProfile(id);
        const response = {
            success: true,
            data: result,
            message: 'Profile classified successfully',
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/portfolio/generate-custom-template
 */
export async function generateCustomTemplateHandler(req, res, next) {
    try {
        const { prompt } = req.body;
        if (!prompt || typeof prompt !== 'string') {
            res.status(400).json({ success: false, error: 'prompt is required' });
            return;
        }
        const result = await generateCustomTemplateService(prompt);
        const response = {
            success: true,
            data: result,
            message: 'Custom template generated successfully',
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
