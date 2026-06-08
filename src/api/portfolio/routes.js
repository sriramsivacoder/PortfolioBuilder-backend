// ============================================================================
// Portfolio Routes — /api/portfolio
// ============================================================================
import { Router } from 'express';
import { createPortfolio, uploadResume, enrichGitHub, generatePortfolio, getPortfolio, updatePortfolio, updateSections, classifyProfile, generateCustomTemplateHandler, } from './controller.js';
import { resumeUpload } from '../../middleware/upload.js';
const router = Router();
// POST /api/portfolio/create — Create a new portfolio
router.post('/create', createPortfolio);
// POST /api/portfolio/upload-resume — Upload and parse a resume
router.post('/upload-resume', resumeUpload.single('resume'), uploadResume);
// POST /api/portfolio/enrich-github — Enrich portfolio with GitHub data
router.post('/enrich-github', enrichGitHub);
// POST /api/portfolio/generate — Generate portfolio content using AI
router.post('/generate', generatePortfolio);
// POST /api/portfolio/generate-custom-template — Generate custom template via AI
router.post('/generate-custom-template', generateCustomTemplateHandler);
// GET /api/portfolio/:id — Get portfolio by ID
router.get('/:id', getPortfolio);
// PUT /api/portfolio/:id — Update portfolio
router.put('/:id', updatePortfolio);
// PUT /api/portfolio/:id/sections — Update sections
router.put('/:id/sections', updateSections);
// POST /api/portfolio/:id/classify — Classify professional category
router.post('/:id/classify', classifyProfile);
export default router;
