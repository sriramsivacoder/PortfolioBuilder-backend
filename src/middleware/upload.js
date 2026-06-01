// ============================================================================
// Upload Middleware — Multer configuration for file uploads
// ============================================================================
import multer from 'multer';
import { ServiceError } from '../types/index.js';
const RESUME_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MEDIA_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const RESUME_MIME_TYPES = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
]);
/**
 * Multer config for resume uploads (PDF/DOCX, max 10MB).
 */
export const resumeUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: RESUME_MAX_SIZE,
        files: 1,
    },
    fileFilter: (_req, file, cb) => {
        if (RESUME_MIME_TYPES.has(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new ServiceError('Only PDF and DOCX files are accepted for resumes', 400));
        }
    },
});
/**
 * Multer config for media/image uploads (max 5MB).
 */
export const mediaUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MEDIA_MAX_SIZE,
        files: 1,
    },
    fileFilter: (_req, file, cb) => {
        if (IMAGE_MIME_TYPES.has(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new ServiceError('Only JPEG, PNG, WebP, GIF, and SVG images are accepted', 400));
        }
    },
});
