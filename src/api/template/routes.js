// ============================================================================
// Template Routes — /api/templates
// ============================================================================
import { Router } from 'express';
import { listTemplates, getTemplate } from './controller.js';
const router = Router();
// GET /api/templates — List all active templates
router.get('/', listTemplates);
// GET /api/templates/:id — Get template by ID
router.get('/:id', getTemplate);
export default router;
