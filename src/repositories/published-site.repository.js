// ============================================================================
// PublishedSite Repository — CRUD operations for PublishedSite documents
// ============================================================================
import mongoose from 'mongoose';
import { PublishedSiteModel } from '../models/index.js';
export class PublishedSiteRepository {
    static async create(data) {
        const site = new PublishedSiteModel({
            ...data,
            portfolioId: new mongoose.Types.ObjectId(data.portfolioId),
        });
        return site.save();
    }
    static async findBySlug(slug) {
        return PublishedSiteModel.findOne({ slug: slug.toLowerCase(), isActive: true });
    }
    static async findAllActive() {
        return PublishedSiteModel.find({ isActive: true }).sort({ publishedAt: -1 });
    }
    static async findByPortfolioId(portfolioId) {
        return PublishedSiteModel.findOne({
            portfolioId: new mongoose.Types.ObjectId(portfolioId),
            isActive: true,
        });
    }
    static async isSlugTaken(slug, excludePortfolioId) {
        const query = { slug: slug.toLowerCase(), isActive: true };
        if (excludePortfolioId) {
            query.portfolioId = { $ne: new mongoose.Types.ObjectId(excludePortfolioId) };
        }
        const count = await PublishedSiteModel.countDocuments(query);
        return count > 0;
    }
    static async updateByPortfolioId(portfolioId, data) {
        return PublishedSiteModel.findOneAndUpdate({ portfolioId: new mongoose.Types.ObjectId(portfolioId), isActive: true }, { $set: data }, { new: true });
    }
    static async deactivateByPortfolioId(portfolioId) {
        return PublishedSiteModel.findOneAndUpdate({ portfolioId: new mongoose.Types.ObjectId(portfolioId) }, { $set: { isActive: false } }, { new: true });
    }
    static async deleteByPortfolioId(portfolioId) {
        const result = await PublishedSiteModel.deleteMany({
            portfolioId: new mongoose.Types.ObjectId(portfolioId),
        });
        return result.deletedCount;
    }
}
