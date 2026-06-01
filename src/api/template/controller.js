// ============================================================================
// Template Controller — HTTP handlers for template endpoints
// ============================================================================
import { getParam } from '../../utils/params.js';
import * as templateService from '../../services/template/index.js';
/**
 * GET /api/templates
 */
export async function listTemplates(_req, res, next) {
    try {
        const templates = await templateService.listTemplates();
        const response = {
            success: true,
            data: templates.map((t) => t.toObject()),
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/templates/:id
 */
export async function getTemplate(req, res, next) {
    try {
        const id = getParam(req.params.id);
        const template = await templateService.getTemplateById(id);
        const response = {
            success: true,
            data: template.toObject(),
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
