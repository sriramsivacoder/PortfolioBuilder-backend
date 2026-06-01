// ============================================================================
// SEO Routes — Sitemap and robots.txt
// ============================================================================
import { Router } from 'express';
import { PublishedSiteRepository } from '../../repositories/published-site.repository.js';
import { config } from '../../config/index.js';
const router = Router();
/**
 * GET /api/seo/sitemap.xml — Dynamic sitemap of published portfolios
 */
router.get('/sitemap.xml', async (_req, res, next) => {
    try {
        const sites = await PublishedSiteRepository.findAllActive();
        const baseUrl = config.clientUrl.replace(/\/$/, '');
        const urls = sites
            .map((site) => `  <url>
    <loc>${baseUrl}/p/${site.slug}</loc>
    <lastmod>${site.publishedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
            .join('\n');
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${urls}
</urlset>`;
        res.type('application/xml').send(sitemap);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/seo/robots.txt — Robots directives
 */
router.get('/robots.txt', (_req, res) => {
    const baseUrl = config.clientUrl.replace(/\/$/, '');
    res.type('text/plain').send(`User-agent: *
Allow: /
Allow: /p/

Sitemap: ${baseUrl}/api/seo/sitemap.xml
`);
});
export default router;
