// ============================================================================
// Media Routes — /api/media
// ============================================================================
import { Router } from 'express';
import { uploadMedia, deleteMedia } from './controller.js';
import { mediaUpload } from '../../middleware/upload.js';
const router = Router();
// POST /api/media/upload — Upload a media file
router.post('/upload', mediaUpload.single('media'), uploadMedia);
// DELETE /api/media/:id — Delete a media file
router.delete('/:id', deleteMedia);
export default router;
