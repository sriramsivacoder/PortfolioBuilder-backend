// ============================================================================
// Draft Model — Portfolio snapshot/versioning schema
// ============================================================================
import mongoose, { Schema } from 'mongoose';
const DraftSchema = new Schema({
    portfolioId: {
        type: Schema.Types.ObjectId,
        ref: 'Portfolio',
        required: true,
        index: true,
    },
    sessionId: { type: String, required: true, index: true },
    snapshot: { type: Schema.Types.Mixed, required: true },
    version: { type: Number, required: true, default: 1 },
    savedAt: { type: Date, default: Date.now },
}, {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
DraftSchema.index({ portfolioId: 1, version: -1 });
/**
 * Pre-save hook to auto-increment version number for a given portfolio.
 */
DraftSchema.pre('save', async function () {
    if (this.isNew) {
        try {
            const lastDraft = await DraftModel.findOne({ portfolioId: this.portfolioId }, { version: 1 }, { sort: { version: -1 } });
            this.version = lastDraft ? lastDraft.version + 1 : 1;
        }
        catch {
            this.version = 1;
        }
    }
});
export const DraftModel = mongoose.model('Draft', DraftSchema);
