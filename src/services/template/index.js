// ============================================================================
// Template Service — Template listing and retrieval
// ============================================================================
import { TemplateRepository } from '../../repositories/template.repository.js';
import { ServiceError } from '../../types/index.js';
/**
 * List all active templates.
 */
export async function listTemplates() {
    try {
        return await TemplateRepository.findAll(true);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to list templates: ${message}`, 500);
    }
}
/**
 * Get a template by its MongoDB ID.
 */
export async function getTemplateById(id) {
    try {
        const template = await TemplateRepository.findById(id);
        if (!template) {
            throw new ServiceError('Template not found', 404);
        }
        return template;
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to get template: ${message}`, 500);
    }
}
/**
 * Get a template by its templateId (e.g., 'minimal', 'developer').
 */
export async function getTemplateByTemplateId(templateId) {
    try {
        const template = await TemplateRepository.findByTemplateId(templateId);
        if (!template) {
            throw new ServiceError(`Template "${templateId}" not found`, 404);
        }
        return template;
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to get template: ${message}`, 500);
    }
}
/**
 * Get default design settings for a template.
 */
export async function getDefaultDesign(templateId) {
    try {
        const template = await getTemplateByTemplateId(templateId);
        return template.defaultDesign;
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to get default design: ${message}`, 500);
    }
}
