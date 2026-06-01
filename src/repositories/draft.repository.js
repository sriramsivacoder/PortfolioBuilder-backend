// ============================================================================
// Draft Repository — CRUD operations for Draft documents
// ============================================================================
import mongoose from 'mongoose';
import { DraftModel } from '../models/index.js';
export class DraftRepository {
    static async create(data) {
        const draft = new DraftModel({
            portfolioId: new mongoose.Types.ObjectId(data.portfolioId),
            sessionId: data.sessionId,
            snapshot: data.snapshot,
        });
        return draft.save();
    }
    static async findLatestByPortfolioId(portfolioId) {
        return DraftModel.findOne({ portfolioId: new mongoose.Types.ObjectId(portfolioId) })
            .sort({ version: -1 });
    }
    static async findByPortfolioIdAndVersion(portfolioId, version) {
        return DraftModel.findOne({
            portfolioId: new mongoose.Types.ObjectId(portfolioId),
            version,
        });
    }
    static async findHistoryByPortfolioId(portfolioId, limit = 20) {
        return DraftModel.find({ portfolioId: new mongoose.Types.ObjectId(portfolioId) }, { _id: 1, version: 1, savedAt: 1 })
            .sort({ version: -1 })
            .limit(limit);
    }
    static async deleteByPortfolioId(portfolioId) {
        const result = await DraftModel.deleteMany({
            portfolioId: new mongoose.Types.ObjectId(portfolioId),
        });
        return result.deletedCount;
    }
    static async deleteOldDrafts(portfolioId, keepCount = 50) {
        const drafts = await DraftModel.find({ portfolioId: new mongoose.Types.ObjectId(portfolioId) }, { _id: 1 })
            .sort({ version: -1 })
            .skip(keepCount);
        if (drafts.length === 0)
            return 0;
        const idsToDelete = drafts.map((d) => d._id);
        const result = await DraftModel.deleteMany({ _id: { $in: idsToDelete } });
        return result.deletedCount;
    }
}
