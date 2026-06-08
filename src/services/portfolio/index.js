// ============================================================================
// Portfolio Service — Business logic for portfolio lifecycle
// ============================================================================
import { v4 as uuidv4 } from 'uuid';
import { PortfolioRepository } from '../../repositories/portfolio.repository.js';
import { TemplateRepository } from '../../repositories/template.repository.js';
import { parseResume } from '../resume-parser/index.js';
import { fetchGitHubProfile } from '../github/index.js';
import { generatePortfolioContent } from '../ai-generator/index.js';
import { classifyProfile } from '../profile-classifier/index.js';
import { ServiceError } from '../../types/index.js';
import { getDefaultSectionsForTemplate, getTemplateConfig } from '../../shared/template-registry.js';

const SECTION_TITLES = {
    hero: 'Hero',
    about: 'About',
    skills: 'Skills',
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    certifications: 'Certifications',
    contact: 'Contact',
    'github-stats': 'GitHub Stats',
    'tech-stack': 'Tech Stack',
    'case-studies': 'Case Studies',
    gallery: 'Gallery',
    services: 'Services',
    testimonials: 'Testimonials',
    publications: 'Publications',
    timeline: 'Timeline',
    'media-showcase': 'Media Showcase',
    'social-proof': 'Social Proof',
};
/**
 * Default sections created for a new portfolio.
 */
function createDefaultSections(templateId = 'dev-minimal') {
    const sectionTypes = getDefaultSectionsForTemplate(templateId);
    return sectionTypes.map((type, index) => ({
        id: uuidv4(),
        type,
        title: SECTION_TITLES[type] ?? type,
        visible: true,
        order: index,
        animation: { type: 'rise', duration: 650, delay: index * 60, distance: 28, easing: 'smooth', repeatOnScroll: false },
    }));
}

function buildDefaultDesignFromRegistry(templateId) {
    const config = getTemplateConfig(templateId);
    return {
        colors: config.colors.light,
        typography: { ...config.typography },
        spacing: { ...config.spacing },
        borderShadow: { ...config.borderShadow },
        animations: {},
    };
}
function createEmptySourceData(portfolio) {
    const github = portfolio.githubData;
    const linkedin = portfolio.linkedinData;
    const githubSkills = github?.languages
        ? Object.keys(github.languages).filter(Boolean)
        : [];
    const githubProjects = github?.repos?.slice(0, 6).map((repo, index) => ({
        id: `github-project-${index + 1}`,
        title: repo.name,
        description: repo.description ?? `A public ${repo.language ?? 'software'} project from GitHub.`,
        technologies: [repo.language, ...(repo.topics ?? [])].filter(Boolean),
        url: repo.url,
        githubUrl: repo.url,
        featured: index < 3,
        stars: repo.stars ?? 0,
    })) ?? [];
    return {
        name: github?.username ?? 'Portfolio Owner',
        headline: linkedin?.headline ?? github?.bio ?? 'Professional Portfolio',
        summary: linkedin?.summary ?? github?.bio ?? '',
        skills: githubSkills.length
            ? [{ id: 'skill-cat-github', category: 'GitHub Languages', skills: githubSkills }]
            : [],
        education: [],
        experience: [],
        projects: githubProjects,
        certifications: [],
        contact: {
            github: github?.profileUrl,
            linkedin: linkedin?.url,
        },
    };
}
function buildSourceData(portfolio) {
    const base = portfolio.resumeData ? portfolio.resumeData.toObject?.() ?? portfolio.resumeData : createEmptySourceData(portfolio);
    const github = portfolio.githubData;
    const linkedin = portfolio.linkedinData;
    const githubSkills = github?.languages ? Object.keys(github.languages).filter(Boolean) : [];
    const existingSkills = Array.isArray(base.skills) ? base.skills : [];
    const skills = existingSkills.length || !githubSkills.length
        ? existingSkills
        : [{ id: 'skill-cat-github', category: 'GitHub Languages', skills: githubSkills }];
    const githubProjects = github?.repos?.slice(0, 6).map((repo, index) => ({
        id: `github-project-${index + 1}`,
        title: repo.name,
        description: repo.description ?? `A public ${repo.language ?? 'software'} project from GitHub.`,
        technologies: [repo.language, ...(repo.topics ?? [])].filter(Boolean),
        url: repo.url,
        githubUrl: repo.url,
        featured: index < 3,
        stars: repo.stars ?? 0,
    })) ?? [];
    const projects = Array.isArray(base.projects) && base.projects.length ? base.projects : githubProjects;
    return {
        name: base.name || github?.username || 'Portfolio Owner',
        headline: base.headline || linkedin?.headline || github?.bio || 'Professional Portfolio',
        summary: base.summary || linkedin?.summary || github?.bio || '',
        skills,
        education: Array.isArray(base.education) ? base.education : [],
        experience: Array.isArray(base.experience) ? base.experience : [],
        projects,
        certifications: Array.isArray(base.certifications) ? base.certifications : [],
        contact: {
            ...(base.contact ?? {}),
            github: base.contact?.github ?? github?.profileUrl,
            linkedin: base.contact?.linkedin ?? linkedin?.url,
        },
    };
}
function hasUsableSource(portfolio) {
    return Boolean(portfolio.resumeData || portfolio.githubData || portfolio.linkedinData);
}
function createStarterContent(portfolio) {
    const source = buildSourceData(portfolio);
    return {
        hero: {
            title: source.name === 'Portfolio Owner' ? 'Your Name' : `Hi, I'm ${source.name}`,
            subtitle: source.headline || 'Build a portfolio from resume, GitHub, LinkedIn, or manual edits.',
            tagline: 'Ready to customize',
            ctaText: 'View My Work',
            ctaUrl: '#projects',
            backgroundStyle: 'gradient',
        },
        about: {
            heading: 'About Me',
            paragraphs: [
                source.summary || 'Use the editor to shape this portfolio around your story, skills, projects, and career goals.',
                'You can add, remove, reorder, and animate sections without relying on a resume as the main source.',
            ],
            highlights: ['Editable content', 'Flexible sections', 'Modern templates', 'Publish-ready design'],
        },
        skills: source.skills,
        projects: source.projects,
        experience: source.experience,
        education: source.education,
        certifications: source.certifications,
        contact: source.contact,
    };
}
/**
 * Create a new portfolio for a session.
 */
export async function createPortfolio(sessionId) {
    try {
        // Get default template design
        const defaultTemplate = await TemplateRepository.findByTemplateId('dev-minimal');
        const designSettings = defaultTemplate?.defaultDesign ?? buildDefaultDesignFromRegistry('dev-minimal');
        const portfolio = await PortfolioRepository.create({
            sessionId,
            selectedTemplate: 'dev-minimal',
            templateFamily: getTemplateConfig('dev-minimal').family,
            designSettings: designSettings,
            sections: createDefaultSections('dev-minimal'),
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
        let resolvedTemplateId = portfolio.selectedTemplate ?? 'dev-minimal';
        let templateConfig = getTemplateConfig(resolvedTemplateId);
        // If a template is specified, update the portfolio template and design
        if (templateId) {
            templateConfig = getTemplateConfig(templateId);
            resolvedTemplateId = templateConfig.id;
            const template = await TemplateRepository.findByTemplateId(resolvedTemplateId);
            await PortfolioRepository.update(portfolioId, {
                selectedTemplate: resolvedTemplateId,
                templateFamily: templateConfig.family,
                designSettings: template?.defaultDesign ?? buildDefaultDesignFromRegistry(resolvedTemplateId),
                sections: createDefaultSections(resolvedTemplateId),
            });
        }
        const sourceData = buildSourceData(portfolio);
        const sectionTypes = getDefaultSectionsForTemplate(resolvedTemplateId);
        const content = hasUsableSource(portfolio)
            ? await generatePortfolioContent(sourceData, portfolio.githubData, portfolio.linkedinData, {
                professionalCategory: portfolio.professionalCategory ?? templateConfig.family,
                templateFamily: templateConfig.family,
                sectionTypes,
            })
            : createStarterContent(portfolio);
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
        const nextUpdates = { ...updates };
        if (nextUpdates.selectedTemplate) {
            nextUpdates.templateFamily = getTemplateConfig(nextUpdates.selectedTemplate).family;
        }
        const updated = await PortfolioRepository.update(portfolioId, nextUpdates);
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

/**
 * Classify a portfolio's professional category based on available data.
 */
export async function classifyPortfolioProfile(portfolioId) {
    try {
        const portfolio = await getPortfolio(portfolioId);
        const resumeData = portfolio.resumeData?.toObject?.() ?? portfolio.resumeData ?? null;
        const githubData = portfolio.githubData?.toObject?.() ?? portfolio.githubData ?? null;
        const linkedinData = portfolio.linkedinData?.toObject?.() ?? portfolio.linkedinData ?? null;

        const result = classifyProfile({ resumeData, githubData, linkedinData });

        // Update portfolio with classification
        await PortfolioRepository.update(portfolioId, {
            professionalCategory: result.primaryCategory,
            templateFamily: result.primaryCategory,
        });

        return result;
    }
    catch (error) {
        if (error instanceof ServiceError) throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to classify profile: ${message}`, 500);
    }
}
