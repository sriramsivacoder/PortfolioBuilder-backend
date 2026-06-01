// ============================================================================
// Media Model — Uploaded media files metadata
// ============================================================================
import mongoose, { Schema } from 'mongoose';
const MediaSchema = new Schema({
    portfolioId: {
        type: Schema.Types.ObjectId,
        ref: 'Portfolio',
        required: true,
        index: true,
    },
    sessionId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
}, {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
MediaSchema.index({ portfolioId: 1, sessionId: 1 });
export const MediaModel = mongoose.model('Media', MediaSchema);
