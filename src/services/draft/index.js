// ============================================================================
// Draft Service — Save/load portfolio snapshots with versioning
// ============================================================================
import { DraftRepository } from '../../repositories/draft.repository.js';
import { PortfolioRepository } from '../../repositories/portfolio.repository.js';
import { ServiceError } from '../../types/index.js';
/**
 * Save a snapshot of the current portfolio state as a draft.
 */
export async function saveDraft(portfolioId, sessionId) {
    try {
        // Fetch current portfolio state
        const portfolio = await PortfolioRepository.findById(portfolioId);
        if (!portfolio) {
            throw new ServiceError('Portfolio not found', 404);
        }
        // Verify session ownership
        if (portfolio.sessionId !== sessionId) {
            throw new ServiceError('Unauthorized: session does not own this portfolio', 403);
        }
        // Create snapshot
        const snapshot = portfolio.toObject();
        // Remove MongoDB internal fields from snapshot
        const { _id: _removed, __v: _v, ...cleanSnapshot } = snapshot;
        const draft = await DraftRepository.create({
            portfolioId,
            sessionId,
            snapshot: cleanSnapshot,
        });
        // Clean up old drafts (keep last 50)
        await DraftRepository.deleteOldDrafts(portfolioId, 50);
        return draft;
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to save draft: ${message}`, 500);
    }
}
/**
 * Load the latest draft for a portfolio.
 */
export async function loadLatestDraft(portfolioId) {
    try {
        const draft = await DraftRepository.findLatestByPortfolioId(portfolioId);
        if (!draft) {
            throw new ServiceError('No drafts found for this portfolio', 404);
        }
        return draft;
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to load draft: ${message}`, 500);
    }
}
/**
 * Get draft version history for a portfolio.
 */
export async function getDraftHistory(portfolioId, limit = 20) {
    try {
        // Verify portfolio exists
        const portfolio = await PortfolioRepository.findById(portfolioId);
        if (!portfolio) {
            throw new ServiceError('Portfolio not found', 404);
        }
        return await DraftRepository.findHistoryByPortfolioId(portfolioId, limit);
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to get draft history: ${message}`, 500);
    }
}
/**
 * Load a specific draft version.
 */
export async function loadDraftVersion(portfolioId, version) {
    try {
        const draft = await DraftRepository.findByPortfolioIdAndVersion(portfolioId, version);
        if (!draft) {
            throw new ServiceError(`Draft version ${version} not found`, 404);
        }
        return draft;
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to load draft version: ${message}`, 500);
    }
}
