// ============================================================================
// Media Controller — HTTP handlers for media upload/delete
// ============================================================================
import { getParam } from '../../utils/params.js';
import * as mediaService from '../../services/media/index.js';
/**
 * POST /api/media/upload — Upload a media file
 */
export async function uploadMedia(req, res, next) {
    try {
        const sessionId = req.sessionId;
        const { portfolioId } = req.body;
        if (!portfolioId) {
            res.status(400).json({ success: false, error: 'portfolioId is required' });
            return;
        }
        const file = req.file;
        if (!file) {
            res.status(400).json({ success: false, error: 'Image file is required' });
            return;
        }
        const media = await mediaService.uploadMedia(portfolioId, sessionId, {
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        });
        const response = {
            success: true,
            data: {
                mediaId: media._id.toString(),
                url: media.url,
                filename: media.filename,
            },
            message: 'Media uploaded successfully',
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * DELETE /api/media/:id — Delete a media file
 */
export async function deleteMedia(req, res, next) {
    try {
        const id = getParam(req.params.id);
        const sessionId = req.sessionId;
        await mediaService.deleteMedia(id, sessionId);
        const response = {
            success: true,
            message: 'Media deleted successfully',
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
