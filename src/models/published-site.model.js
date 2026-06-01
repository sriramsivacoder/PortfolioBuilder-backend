// ============================================================================
// PublishedSite Model — Published portfolio snapshots
// ============================================================================
import mongoose, { Schema } from 'mongoose';
const SeoSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    ogImage: { type: String },
}, { _id: false });
const PublishedSiteSchema = new Schema({
    portfolioId: {
        type: Schema.Types.ObjectId,
        ref: 'Portfolio',
        required: true,
        index: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true,
    },
    publishedContent: { type: Schema.Types.Mixed, required: true },
    seo: { type: SeoSchema, required: true },
    template: { type: String, required: true },
    designSettings: { type: Schema.Types.Mixed, required: true },
    sections: [{ type: Schema.Types.Mixed }],
    themeMode: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
    profileImageUrl: { type: String },
    publishedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
export const PublishedSiteModel = mongoose.model('PublishedSite', PublishedSiteSchema);
