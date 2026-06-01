// ============================================================================
// Template Repository — CRUD operations for Template documents
// ============================================================================
import { TemplateModel } from '../models/index.js';
export class TemplateRepository {
    static async findAll(activeOnly = true) {
        const filter = activeOnly ? { isActive: true } : {};
        return TemplateModel.find(filter).sort({ templateId: 1 });
    }
    static async findById(id) {
        return TemplateModel.findById(id);
    }
    static async findByTemplateId(templateId) {
        return TemplateModel.findOne({ templateId });
    }
    static async create(data) {
        const template = new TemplateModel(data);
        return template.save();
    }
    static async upsertByTemplateId(templateId, data) {
        const result = await TemplateModel.findOneAndUpdate({ templateId }, { $set: data }, { new: true, upsert: true, runValidators: true });
        return result;
    }
    static async update(id, data) {
        return TemplateModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    }
    static async deactivate(templateId) {
        return TemplateModel.findOneAndUpdate({ templateId }, { $set: { isActive: false } }, { new: true });
    }
    static async deleteByTemplateId(templateId) {
        return TemplateModel.findOneAndDelete({ templateId });
    }
}
