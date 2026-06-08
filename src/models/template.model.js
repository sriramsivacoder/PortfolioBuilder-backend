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
        enum: [
            // New template IDs
            'dev-terminal', 'dev-minimal',
            'student-modern', 'student-campus',
            'designer-casestudy', 'designer-showcase',
            'graphic-masonry', 'graphic-spotlight',
            'freelancer-convert', 'freelancer-agency',
            'founder-executive', 'founder-timeline',
            'photo-gallery', 'photo-story',
            'creator-media', 'creator-hub',
            'researcher-academic', 'researcher-modern',
            'hybrid-flex',
            // Legacy template IDs (backward compat)
            'notion', 'minimal', 'developer', 'modern', 'creative', 'editorial', 'neon', 'executive',
        ],
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    family: {
        type: String,
        enum: ['developer', 'student', 'uiux-designer', 'graphic-designer', 'freelancer', 'founder', 'photographer', 'content-creator', 'researcher', 'hybrid'],
    },
    category: {
        type: String,
        enum: ['minimal', 'professional', 'creative', 'developer', 'academic', 'business', 'media'],
    },
    targetAudience: [{ type: String }],
    animationLevel: {
        type: String,
        enum: ['very-low', 'low', 'medium', 'medium-high', 'high'],
    },
    defaultSections: [{ type: String }],
    defaultDesign: { type: DesignSettingsSchema, required: true },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
export const TemplateModel = mongoose.model('Template', TemplateSchema);
