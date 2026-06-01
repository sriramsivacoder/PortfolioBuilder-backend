// ============================================================================
// Publish Controller — HTTP handlers for publish endpoints
// ============================================================================
import { getParam } from '../../utils/params.js';
import * as publishService from '../../services/publish/index.js';
import { publishSchema } from '../../validators/publish.validator.js';
import { config } from '../../config/index.js';
/**
 * POST /api/publish/:portfolioId — Publish a portfolio
 */
export async function publishPortfolio(req, res, next) {
    try {
        const portfolioId = getParam(req.params.portfolioId);
        const validated = publishSchema.parse(req.body);
        const site = await publishService.publishPortfolio(portfolioId, validated.slug);
        const response = {
            success: true,
            data: {
                slug: site.slug,
                url: `${config.clientUrl}/p/${site.slug}`,
                publishedAt: site.publishedAt.toISOString(),
            },
            message: 'Portfolio published successfully',
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/publish/:slug — Get published site by slug
 */
export async function getPublishedSite(req, res, next) {
    try {
        const slug = getParam(req.params.slug);
        const site = await publishService.getPublishedSite(slug);
        const response = {
            success: true,
            data: {
                content: site.publishedContent,
                design: site.designSettings,
                sections: site.sections,
                template: site.template,
                themeMode: site.themeMode,
                seo: site.seo,
                profileImageUrl: site.profileImageUrl ?? undefined,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
