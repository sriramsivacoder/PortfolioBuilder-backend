// ============================================================================
// Portfolio Repository — CRUD operations for Portfolio documents
// ============================================================================
import { PortfolioModel } from '../models/index.js';
export class PortfolioRepository {
    static async create(data) {
        const portfolio = new PortfolioModel(data);
        return portfolio.save();
    }
    static async findById(id) {
        return PortfolioModel.findById(id);
    }
    static async findBySessionId(sessionId) {
        return PortfolioModel.find({ sessionId }).sort({ updatedAt: -1 });
    }
    static async findLatestBySessionId(sessionId) {
        return PortfolioModel.findOne({ sessionId }).sort({ updatedAt: -1 });
    }
    static async update(id, data) {
        return PortfolioModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    }
    static async updateResumeData(id, resumeData) {
        return PortfolioModel.findByIdAndUpdate(id, { $set: { resumeData } }, { new: true });
    }
    static async updateGitHubData(id, githubData) {
        return PortfolioModel.findByIdAndUpdate(id, { $set: { githubData } }, { new: true });
    }
    static async updateLinkedInData(id, linkedinData) {
        return PortfolioModel.findByIdAndUpdate(id, { $set: { linkedinData } }, { new: true });
    }
    static async updateGeneratedContent(id, generatedContent) {
        return PortfolioModel.findByIdAndUpdate(id, { $set: { generatedContent } }, { new: true });
    }
    static async updateDesignSettings(id, designSettings) {
        return PortfolioModel.findByIdAndUpdate(id, { $set: { designSettings } }, { new: true });
    }
    static async updateSections(id, sections) {
        return PortfolioModel.findByIdAndUpdate(id, { $set: { sections } }, { new: true });
    }
    static async updateTemplate(id, templateId, designSettings) {
        return PortfolioModel.findByIdAndUpdate(id, { $set: { selectedTemplate: templateId, designSettings } }, { new: true });
    }
    static async updateThemeMode(id, themeMode) {
        return PortfolioModel.findByIdAndUpdate(id, { $set: { themeMode } }, { new: true });
    }
    static async updateProfileImage(id, profileImageUrl) {
        return PortfolioModel.findByIdAndUpdate(id, { $set: { profileImageUrl } }, { new: true });
    }
    static async updateStatus(id, status) {
        return PortfolioModel.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    }
    static async deleteById(id) {
        return PortfolioModel.findByIdAndDelete(id);
    }
    static async deleteBySessionId(sessionId) {
        const result = await PortfolioModel.deleteMany({ sessionId });
        return result.deletedCount;
    }
}
