// ============================================================================
// Portfolio Service — Business logic for portfolio lifecycle
// ============================================================================
import { v4 as uuidv4 } from 'uuid';
import { PortfolioRepository } from '../../repositories/portfolio.repository.js';
import { TemplateRepository } from '../../repositories/template.repository.js';
import { parseResume } from '../resume-parser/index.js';
import { fetchGitHubProfile } from '../github/index.js';
import { generatePortfolioContent } from '../ai-generator/index.js';
import { ServiceError } from '../../types/index.js';
/**
 * Default sections created for a new portfolio.
 */
function createDefaultSections() {
    const sectionTypes = [
        { type: 'hero', title: 'Hero' },
        { type: 'about', title: 'About Me' },
        { type: 'skills', title: 'Skills' },
        { type: 'experience', title: 'Experience' },
        { type: 'projects', title: 'Projects' },
        { type: 'education', title: 'Education' },
        { type: 'certifications', title: 'Certifications' },
        { type: 'contact', title: 'Contact' },
    ];
    return sectionTypes.map((s, index) => ({
        id: uuidv4(),
        type: s.type,
        title: s.title,
        visible: true,
        order: index,
        animation: { type: 'fade', duration: 300, delay: 0 },
    }));
}
/**
 * Create a new portfolio for a session.
 */
export async function createPortfolio(sessionId) {
    try {
        // Get default template design
        const defaultTemplate = await TemplateRepository.findByTemplateId('minimal');
        const designSettings = defaultTemplate?.defaultDesign ?? null;
        const portfolio = await PortfolioRepository.create({
            sessionId,
            selectedTemplate: 'minimal',
            designSettings: designSettings,
            sections: createDefaultSections(),
            themeMode: 'light',
            status: 'draft',
        });
        return portfolio;
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to create portfolio: ${message}`, 500);
    }
}
/**
 * Get a portfolio by ID with validation.
 */
export async function getPortfolio(portfolioId) {
    try {
        const portfolio = await PortfolioRepository.findById(portfolioId);
        if (!portfolio) {
            throw new ServiceError('Portfolio not found', 404);
        }
        return portfolio;
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to get portfolio: ${message}`, 500);
    }
}
/**
 * Upload and parse a resume, updating the portfolio with extracted data.
 */
export async function uploadResume(portfolioId, buffer, mimeType) {
    try {
        // Verify portfolio exists
        const portfolio = await getPortfolio(portfolioId);
        // Parse the resume
        const resumeData = await parseResume(buffer, mimeType);
        // Update portfolio with parsed resume data
        await PortfolioRepository.updateResumeData(portfolio._id.toString(), resumeData);
        return resumeData;
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to upload resume: ${message}`, 500);
    }
}
/**
 * Enrich portfolio with GitHub profile data.
 */
export async function enrichWithGitHub(portfolioId, githubUrl) {
    try {
        // Verify portfolio exists
        const portfolio = await getPortfolio(portfolioId);
        // Fetch GitHub data
        const githubData = await fetchGitHubProfile(githubUrl);
        // Update portfolio
        await PortfolioRepository.updateGitHubData(portfolio._id.toString(), githubData);
        // If we got an avatar and no profile image set, use it
        if (githubData.avatarUrl && !portfolio.profileImageUrl) {
            await PortfolioRepository.updateProfileImage(portfolio._id.toString(), githubData.avatarUrl);
        }
        return githubData;
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to enrich with GitHub: ${message}`, 500);
    }
}
/**
 * Generate portfolio content using AI, optionally applying a template.
 */
export async function generateContent(portfolioId, templateId) {
    try {
        const portfolio = await getPortfolio(portfolioId);
        if (!portfolio.resumeData) {
            throw new ServiceError('Resume data is required before generating content. Please upload a resume first.', 400);
        }
        // If a template is specified, update the portfolio template and design
        if (templateId) {
            const template = await TemplateRepository.findByTemplateId(templateId);
            if (template) {
                await PortfolioRepository.updateTemplate(portfolioId, templateId, template.defaultDesign);
            }
        }
        // Generate content with AI
        const content = await generatePortfolioContent(portfolio.resumeData, portfolio.githubData, portfolio.linkedinData);
        // Update the portfolio with generated content
        await PortfolioRepository.updateGeneratedContent(portfolioId, content);
        // Fetch the updated portfolio
        const updatedPortfolio = await getPortfolio(portfolioId);
        return {
            content,
            portfolio: updatedPortfolio.toObject(),
        };
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to generate content: ${message}`, 500);
    }
}
/**
 * Update portfolio fields.
 */
export async function updatePortfolio(portfolioId, updates) {
    try {
        await getPortfolio(portfolioId); // Verify exists
        const updated = await PortfolioRepository.update(portfolioId, updates);
        if (!updated) {
            throw new ServiceError('Failed to update portfolio', 500);
        }
        return updated;
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to update portfolio: ${message}`, 500);
    }
}
/**
 * Update portfolio sections (order, visibility, etc.)
 */
export async function updateSections(portfolioId, sections) {
    try {
        await getPortfolio(portfolioId); // Verify exists
        const updated = await PortfolioRepository.updateSections(portfolioId, sections);
        if (!updated) {
            throw new ServiceError('Failed to update sections', 500);
        }
        return updated;
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to update sections: ${message}`, 500);
    }
}
