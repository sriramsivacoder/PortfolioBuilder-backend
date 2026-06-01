// ============================================================================
// Media Service — Upload/delete media via Cloudinary
// ============================================================================
import { v4 as uuidv4 } from 'uuid';
import { uploadToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.js';
import { MediaRepository } from '../../repositories/media.repository.js';
import { PortfolioRepository } from '../../repositories/portfolio.repository.js';
import { ServiceError } from '../../types/index.js';
/**
 * Upload a media file to Cloudinary and store metadata.
 */
export async function uploadMedia(portfolioId, sessionId, file) {
    try {
        // Verify portfolio exists
        const portfolio = await PortfolioRepository.findById(portfolioId);
        if (!portfolio) {
            throw new ServiceError('Portfolio not found', 404);
        }
        // Verify session ownership
        if (portfolio.sessionId !== sessionId) {
            throw new ServiceError('Unauthorized: session does not own this portfolio', 403);
        }
        // Generate unique filename
        const ext = file.originalname.split('.').pop() ?? 'bin';
        const filename = `${uuidv4()}.${ext}`;
        // Upload to Cloudinary
        const { secureUrl, publicId } = await uploadToCloudinary(file.buffer, 'media', { publicId: filename.replace(`.${ext}`, '') });
        // Store metadata in MongoDB
        const media = await MediaRepository.create({
            portfolioId,
            sessionId,
            filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: secureUrl,
            publicId,
        });
        return media;
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to upload media: ${message}`, 500);
    }
}
/**
 * Delete a media file from Cloudinary and remove metadata.
 */
export async function deleteMedia(mediaId, sessionId) {
    try {
        const media = await MediaRepository.findById(mediaId);
        if (!media) {
            throw new ServiceError('Media not found', 404);
        }
        // Verify session ownership
        if (media.sessionId !== sessionId) {
            throw new ServiceError('Unauthorized: session does not own this media', 403);
        }
        // Delete from Cloudinary
        await deleteFromCloudinary(media.publicId);
        // Delete metadata from MongoDB
        await MediaRepository.deleteById(mediaId);
    }
    catch (error) {
        if (error instanceof ServiceError)
            throw error;
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to delete media: ${message}`, 500);
    }
}
/**
 * List all media for a portfolio.
 */
export async function listMediaByPortfolio(portfolioId) {
    try {
        return await MediaRepository.findByPortfolioId(portfolioId);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ServiceError(`Failed to list media: ${message}`, 500);
    }
}
