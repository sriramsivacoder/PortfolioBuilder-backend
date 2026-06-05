// ============================================================================
// Publish Routes — /api/publish
// ============================================================================
import { Router } from 'express';
import { publishPortfolio, getPublishedSite } from './controller.js';
const router = Router();
// POST /api/publish/portfolio/:portfolioId — Publish a portfolio with a slug
// Namespaced under /portfolio/ to avoid collision with slugs that look like ObjectIds
router.post('/portfolio/:portfolioId', publishPortfolio);
// GET /api/publish/:slug — Get published site by slug (public)
router.get('/:slug', getPublishedSite);
export default router;
