// ============================================================================
// Publish Service — Publish portfolio as a public site
// ============================================================================
import { PublishedSiteRepository } from '../../repositories/published-site.repository.js';
import { PortfolioRepository } from '../../repositories/portfolio.repository.js';
import { ServiceError } from '../../types/index.js';
import { TEMPLATE_COLORS, TEMPLATE_TYPOGRAPHY } from '../../shared/template.js';

/**
 * Build a complete default designSettings object for a given template.
 * Used as a fallback when portfolio.designSettings is null (e.g. portfolios
 * created before the design editor was used, or in early wizard flow).
 */
function buildDefaultDesignSettings(templateId = 'notion') {
    const templateKey = TEMPLATE_COLORS[templateId] ? templateId : 'notion';
    const colors = TEMPLATE_COLORS[templateKey].light;
    const typography = TEMPLATE_TYPOGRAPHY[templateKey] ?? TEMPLATE_TYPOGRAPHY.notion;
    return {
        colors,
        typography,
        spacing: {
            sectionPadding: templateKey === 'creative' || templateKey === 'editorial' ? 72 : 64,
            contentMaxWidth:
                templateKey === 'creative' || templateKey === 'editorial' ? 1100
                : templateKey === 'executive' ? 1040
                : 960,
            cardGap: templateKey === 'executive' ? 18 : 24,
        },
        borderShadow: {
            borderRadius:
                templateKey === 'notion' || templateKey === 'neon' ? 8
                : templateKey === 'executive' ? 6
                : 12,
            borderWidth: templateKey === 'neon' ? 2 : 1,
            shadowIntensity:
                templateKey === 'minimal' || templateKey === 'executive' ? 'subtle' : 'medium',
        },
        animations: {},
    };
}

function generateSeoMetadata(content) {
    const name = content.hero?.title?.replace(/^(Hi,?\s*I'm\s*|Hey,?\s*I'm\s*|I'm\s*)/i, '').trim() ?? 'Portfolio';
    const subtitle = content.hero?.subtitle ?? '';
    const aboutText = content.about?.paragraphs?.[0] ?? '';
    const title = `${name} — Portfolio`;
    const description = subtitle.length > 20
        ? subtitle.slice(0, 155)
        : aboutText.slice(0, 155) || `${name}'s professional portfolio`;
    return { title, description };
}

function serializeSubdoc(value) {
    if (value === null || value === undefined) return null;
    return JSON.parse(JSON.stringify(value));
}

export async function publishPortfolio(portfolioId, slug) {
    try {
        const portfolio = await PortfolioRepository.findById(portfolioId);
        if (!portfolio) {
            throw new ServiceError('Portfolio not found', 404);
        }
        if (!portfolio.generatedContent) {
            throw new ServiceError('Portfolio must have generated content before publishing', 400);
        }
        const slugTaken = await PublishedSiteRepository.isSlugTaken(slug, portfolioId);
        if (slugTaken) {
            throw new ServiceError(`Slug "${slug}" is already taken. Please choose a different one.`, 409);
        }
        const seo = generateSeoMetadata(portfolio.generatedContent);
        const existingSite = await PublishedSiteRepository.findByPortfolioId(portfolioId);

        // -------------------------------------------------------------------
        // Guard: designSettings may be null if the user never visited the
        // design panel. Fall back to the template's default palette so the
        // PublishedSite model's `required: true` constraint is satisfied.
        // -------------------------------------------------------------------
        const designSettings =
            portfolio.designSettings
                ? serializeSubdoc(portfolio.designSettings)
                : buildDefaultDesignSettings(portfolio.selectedTemplate ?? 'notion');

        // -------------------------------------------------------------------
        // Guard: sections may be empty/null — fall back to empty array.
        // -------------------------------------------------------------------
        const sections =
            Array.isArray(portfolio.sections) && portfolio.sections.length > 0
                ? serializeSubdoc(portfolio.sections)
                : [];

        const publishPayload = {
            slug,
            publishedContent: serializeSubdoc(portfolio.generatedContent),
            seo,
            template: portfolio.selectedTemplate ?? 'notion',
            designSettings,
            sections,
            themeMode: portfolio.themeMode ?? 'light',
            profileImageUrl: portfolio.profileImageUrl ?? undefined,
            publishedAt: new Date(),
        };

        let publishedSite;
        if (existingSite) {
            const updated = await PublishedSiteRepository.updateByPortfolioId(portfolioId, publishPayload);
            if (!updated) {
                throw new ServiceError('Failed to update published site', 500);
            }
            publishedSite = updated;
        } else {
            publishedSite = await PublishedSiteRepository.create({
                portfolioId,
                ...publishPayload,
            });
        }
        await PortfolioRepository.updateStatus(portfolioId, 'published');
        return publishedSite;
    } catch (error) {
        if (error instanceof ServiceError) throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to publish portfolio: ${message}`, 500);
    }
}

export async function getPublishedSite(slug) {
    try {
        const site = await PublishedSiteRepository.findBySlug(slug);
        if (!site) {
            throw new ServiceError('Published site not found', 404);
        }
        return site;
    } catch (error) {
        if (error instanceof ServiceError) throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to get published site: ${message}`, 500);
    }
}

export async function unpublishPortfolio(portfolioId) {
    try {
        await PublishedSiteRepository.deactivateByPortfolioId(portfolioId);
        await PortfolioRepository.updateStatus(portfolioId, 'draft');
    } catch (error) {
        if (error instanceof ServiceError) throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to unpublish portfolio: ${message}`, 500);
    }
}
