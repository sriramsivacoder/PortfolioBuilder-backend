// ============================================================================
// Portfolio Model — Main portfolio document schema
// ============================================================================
import mongoose, { Schema } from 'mongoose';
const ContactInfoSchema = new Schema({
    email: { type: String },
    phone: { type: String },
    location: { type: String },
    website: { type: String },
    linkedin: { type: String },
    github: { type: String },
}, { _id: false });
const EducationEntrySchema = new Schema({
    id: { type: String, required: true },
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    description: { type: String },
    gpa: { type: String },
}, { _id: false });
const ExperienceEntrySchema = new Schema({
    id: { type: String, required: true },
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    current: { type: Boolean },
    description: { type: String, required: true },
    highlights: [{ type: String }],
    technologies: [{ type: String }],
}, { _id: false });
const ProjectEntrySchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }],
    url: { type: String },
    githubUrl: { type: String },
    imageUrl: { type: String },
    featured: { type: Boolean },
    stars: { type: Number },
}, { _id: false });
const CertificationEntrySchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: String },
    url: { type: String },
    credentialId: { type: String },
}, { _id: false });
const SkillCategorySchema = new Schema({
    id: { type: String, required: true },
    category: { type: String, required: true },
    skills: [{ type: String }],
}, { _id: false });
const ResumeDataSchema = new Schema({
    name: { type: String, required: true },
    headline: { type: String },
    summary: { type: String },
    skills: [SkillCategorySchema],
    education: [EducationEntrySchema],
    experience: [ExperienceEntrySchema],
    projects: [ProjectEntrySchema],
    certifications: [CertificationEntrySchema],
    contact: { type: ContactInfoSchema, default: {} },
}, { _id: false });
const GitHubRepoSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    language: { type: String },
    topics: [{ type: String }],
    updatedAt: { type: String, required: true },
}, { _id: false });
const GitHubDataSchema = new Schema({
    username: { type: String, required: true },
    bio: { type: String },
    avatarUrl: { type: String },
    profileUrl: { type: String, required: true },
    repos: [GitHubRepoSchema],
    languages: { type: Schema.Types.Mixed, default: {} },
    totalStars: { type: Number, default: 0 },
    totalContributions: { type: Number },
}, { _id: false });
const LinkedInDataSchema = new Schema({
    url: { type: String, required: true },
    headline: { type: String },
    summary: { type: String },
}, { _id: false });
const HeroContentSchema = new Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    tagline: { type: String },
    ctaText: { type: String },
    ctaUrl: { type: String },
    backgroundStyle: { type: String, enum: ['gradient', 'solid', 'pattern', 'image'] },
}, { _id: false });
const AboutContentSchema = new Schema({
    heading: { type: String, required: true },
    paragraphs: [{ type: String }],
    highlights: [{ type: String }],
    imageUrl: { type: String },
}, { _id: false });
const GeneratedContentSchema = new Schema({
    hero: { type: HeroContentSchema, required: true },
    about: { type: AboutContentSchema, required: true },
    skills: [SkillCategorySchema],
    projects: [ProjectEntrySchema],
    experience: [ExperienceEntrySchema],
    education: [EducationEntrySchema],
    certifications: [CertificationEntrySchema],
    contact: { type: ContactInfoSchema, default: {} },
}, { _id: false });
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
const SectionAnimationSchema = new Schema({
    type: {
        type: String,
        enum: ['fade', 'rise', 'drop', 'slide', 'slideLeft', 'slideRight', 'scale', 'zoomBlur', 'flip', 'tilt', 'clip', 'blur', 'none'],
        required: true,
    },
    duration: { type: Number },
    delay: { type: Number },
    distance: { type: Number },
    easing: { type: String, enum: ['smooth', 'spring', 'snappy', 'luxury'] },
    repeatOnScroll: { type: Boolean },
}, { _id: false });
const DesignSettingsSchema = new Schema({
    colors: { type: ColorSettingsSchema, required: true },
    typography: { type: TypographySettingsSchema, required: true },
    spacing: { type: SpacingSettingsSchema, required: true },
    borderShadow: { type: BorderShadowSettingsSchema, required: true },
    animations: { type: Schema.Types.Mixed, default: {} },
}, { _id: false });
const SectionConfigSchema = new Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        enum: ['hero', 'about', 'skills', 'experience', 'projects', 'education', 'certifications', 'contact'],
        required: true,
    },
    title: { type: String, required: true },
    visible: { type: Boolean, default: true },
    order: { type: Number, required: true },
    animation: { type: SectionAnimationSchema, default: { type: 'rise', duration: 650, delay: 0, distance: 28, easing: 'smooth', repeatOnScroll: false } },
}, { _id: false });
const PortfolioSchema = new Schema({
    sessionId: { type: String, required: true, index: true },
    resumeData: { type: ResumeDataSchema, default: null },
    githubData: { type: GitHubDataSchema, default: null },
    linkedinData: { type: LinkedInDataSchema, default: null },
    generatedContent: { type: GeneratedContentSchema, default: null },
    selectedTemplate: { type: String, default: 'minimal' },
    designSettings: { type: DesignSettingsSchema, default: null },
    sections: { type: [SectionConfigSchema], default: [] },
    themeMode: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
    profileImageUrl: { type: String },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
PortfolioSchema.index({ sessionId: 1, status: 1 });
export const PortfolioModel = mongoose.model('Portfolio', PortfolioSchema);
