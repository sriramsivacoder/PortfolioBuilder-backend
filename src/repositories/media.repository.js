// ============================================================================
// Media Repository — CRUD operations for Media documents
// ============================================================================
import mongoose from 'mongoose';
import { MediaModel } from '../models/index.js';
export class MediaRepository {
    static async create(data) {
        const media = new MediaModel({
            ...data,
            portfolioId: new mongoose.Types.ObjectId(data.portfolioId),
        });
        return media.save();
    }
    static async findById(id) {
        return MediaModel.findById(id);
    }
    static async findByPortfolioId(portfolioId) {
        return MediaModel.find({ portfolioId: new mongoose.Types.ObjectId(portfolioId) })
            .sort({ uploadedAt: -1 });
    }
    static async findBySessionId(sessionId) {
        return MediaModel.find({ sessionId }).sort({ uploadedAt: -1 });
    }
    static async deleteById(id) {
        return MediaModel.findByIdAndDelete(id);
    }
    static async deleteByPortfolioId(portfolioId) {
        const result = await MediaModel.deleteMany({
            portfolioId: new mongoose.Types.ObjectId(portfolioId),
        });
        return result.deletedCount;
    }
}
