// ============================================================================
// Draft Controller — HTTP handlers for draft endpoints
// ============================================================================
import { getParam } from '../../utils/params.js';
import * as draftService from '../../services/draft/index.js';
/**
 * POST /api/drafts/:portfolioId — Save a draft snapshot
 */
export async function saveDraft(req, res, next) {
    try {
        const portfolioId = getParam(req.params.portfolioId);
        const sessionId = req.sessionId;
        const draft = await draftService.saveDraft(portfolioId, sessionId);
        const response = {
            success: true,
            data: {
                draftId: draft._id.toString(),
                version: draft.version,
                savedAt: draft.savedAt.toISOString(),
            },
            message: 'Draft saved successfully',
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/drafts/:portfolioId — Load latest draft
 */
export async function loadDraft(req, res, next) {
    try {
        const portfolioId = getParam(req.params.portfolioId);
        const draft = await draftService.loadLatestDraft(portfolioId);
        const response = {
            success: true,
            data: {
                draftId: draft._id.toString(),
                version: draft.version,
                savedAt: draft.savedAt.toISOString(),
                snapshot: draft.snapshot,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/drafts/:portfolioId/history — Get draft version history
 */
export async function getDraftHistory(req, res, next) {
    try {
        const portfolioId = getParam(req.params.portfolioId);
        const drafts = await draftService.getDraftHistory(portfolioId);
        const historyEntries = drafts.map((d) => ({
            _id: d._id.toString(),
            version: d.version,
            savedAt: d.savedAt.toISOString(),
        }));
        const response = {
            success: true,
            data: historyEntries,
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
