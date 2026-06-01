// ============================================================================
// Cloudinary — Configuration and upload helper
// ============================================================================
import { v2 as cloudinary } from 'cloudinary';
import { config } from './index.js';
cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
});
/**
 * Upload a buffer to Cloudinary and return the secure URL.
 */
export async function uploadToCloudinary(buffer, folder, options) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: `portfolioforge/${folder}`,
            public_id: options?.publicId,
            resource_type: options?.resourceType ?? 'image',
            transformation: folder === 'profiles'
                ? [{ width: 500, height: 500, crop: 'fill', gravity: 'face', quality: 'auto', format: 'webp' }]
                : [{ quality: 'auto', format: 'webp' }],
        }, (error, result) => {
            if (error) {
                reject(new Error(`Cloudinary upload failed: ${error.message}`));
                return;
            }
            if (!result) {
                reject(new Error('Cloudinary upload returned no result'));
                return;
            }
            resolve({
                secureUrl: result.secure_url,
                publicId: result.public_id,
            });
        });
        uploadStream.end(buffer);
    });
}
/**
 * Delete an asset from Cloudinary by public ID.
 */
export async function deleteFromCloudinary(publicId) {
    try {
        await cloudinary.uploader.destroy(publicId);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to delete Cloudinary asset ${publicId}: ${message}`);
        throw new Error(`Cloudinary delete failed: ${message}`);
    }
}
export { cloudinary };
