// ============================================================================
// Publish Routes — /api/publish
// ============================================================================
import { Router } from 'express';
import { publishPortfolio, getPublishedSite } from './controller.js';
const router = Router();
// POST /api/publish/:portfolioId — Publish a portfolio with a slug
router.post('/:portfolioId', publishPortfolio);
// GET /api/publish/:slug — Get published site by slug (public)
router.get('/:slug', getPublishedSite);
export default router;
