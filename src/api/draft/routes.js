// ============================================================================
// Draft Routes — /api/drafts
// ============================================================================
import { Router } from 'express';
import { saveDraft, loadDraft, getDraftHistory } from './controller.js';
const router = Router();
// POST /api/drafts/:portfolioId — Save a draft
router.post('/:portfolioId', saveDraft);
// GET /api/drafts/:portfolioId — Load latest draft
router.get('/:portfolioId', loadDraft);
// GET /api/drafts/:portfolioId/history — Get draft history
router.get('/:portfolioId/history', getDraftHistory);
export default router;
