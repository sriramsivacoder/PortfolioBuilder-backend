// ============================================================================
// Template Model — Portfolio template schema
// ============================================================================
import mongoose, { Schema } from 'mongoose';
const ColorSettingsSchema = new Schema({
    primary: { type: String, required: true },
    secondary: { type: String, required: true },
    accent: { type: String, required: true },
    background: { type: String, required: true },
    surface: { type: String, required: true },
    text: { type: String, required: true },
    textSecondary: { type: String, required: true },
    border: { type: String, required: true },
}, { _id: false });
const TypographySettingsSchema = new Schema({
    headingFont: { type: String, required: true },
    bodyFont: { type: String, required: true },
    headingWeight: { type: Number, required: true },
    bodyWeight: { type: Number, required: true },
    baseSize: { type: Number, required: true },
    lineHeight: { type: Number, required: true },
    letterSpacing: { type: Number, required: true },
}, { _id: false });
const SpacingSettingsSchema = new Schema({
    sectionPadding: { type: Number, required: true },
    contentMaxWidth: { type: Number, required: true },
    cardGap: { type: Number, required: true },
}, { _id: false });
const BorderShadowSettingsSchema = new Schema({
    borderRadius: { type: Number, required: true },
    borderWidth: { type: Number, required: true },
    shadowIntensity: { type: String, enum: ['none', 'subtle', 'medium', 'strong'], required: true },
}, { _id: false });
const DesignSettingsSchema = new Schema({
    colors: { type: ColorSettingsSchema, required: true },
    typography: { type: TypographySettingsSchema, required: true },
    spacing: { type: SpacingSettingsSchema, required: true },
    borderShadow: { type: BorderShadowSettingsSchema, required: true },
    animations: { type: Schema.Types.Mixed, default: {} },
}, { _id: false });
const TemplateSchema = new Schema({
    templateId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        enum: ['notion', 'minimal', 'developer', 'modern', 'creative', 'editorial', 'neon', 'executive'],
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['minimal', 'professional', 'creative', 'developer'],
    },
    defaultDesign: { type: DesignSettingsSchema, required: true },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
export const TemplateModel = mongoose.model('Template', TemplateSchema);
