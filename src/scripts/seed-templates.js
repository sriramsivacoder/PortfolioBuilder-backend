// ============================================================================
// Seed Templates — Populate default template documents
// ============================================================================
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { TemplateRepository } from '../repositories/template.repository.js';
import { TEMPLATE_COLORS, TEMPLATE_TYPOGRAPHY } from '../shared/template.js';
const TEMPLATE_DEFINITIONS = [
    {
        templateId: 'notion',
        name: 'Notion Style',
        description: 'Clean, blocky layout inspired by Notion. Monochrome with blue accents.',
        thumbnail: '/templates/notion.png',
        category: 'minimal',
    },
    {
        templateId: 'minimal',
        name: 'Minimal',
        description: 'Maximum whitespace with thin typography and floating cards.',
        thumbnail: '/templates/minimal.png',
        category: 'minimal',
    },
    {
        templateId: 'developer',
        name: 'Developer',
        description: 'Terminal-inspired with monospace headings and green accents.',
        thumbnail: '/templates/developer.png',
        category: 'professional',
    },
    {
        templateId: 'modern',
        name: 'Modern Professional',
        description: 'Bold headings with gradient accents and card-based layout.',
        thumbnail: '/templates/modern.png',
        category: 'professional',
    },
    {
        templateId: 'creative',
        name: 'Creative Portfolio',
        description: 'Asymmetric grids with serif headings and warm amber accents.',
        thumbnail: '/templates/creative.png',
        category: 'creative',
    },
    {
        templateId: 'editorial',
        name: 'Editorial Split',
        description: 'Magazine-like spacing, refined contrast, and structured content flow.',
        thumbnail: '/templates/editorial.png',
        category: 'creative',
    },
    {
        templateId: 'neon',
        name: 'Neon Lab',
        description: 'High-contrast tech style with vivid cyan accents and sharp panels.',
        thumbnail: '/templates/neon.png',
        category: 'developer',
    },
    {
        templateId: 'executive',
        name: 'Executive Brief',
        description: 'Premium resume-style portfolio with quiet luxury and dense readability.',
        thumbnail: '/templates/executive.png',
        category: 'professional',
    },
];
function buildDefaultDesign(templateId) {
    return {
        colors: TEMPLATE_COLORS[templateId].light,
        typography: TEMPLATE_TYPOGRAPHY[templateId],
        spacing: {
            sectionPadding: 64,
            contentMaxWidth: templateId === 'creative' || templateId === 'editorial' ? 1100 : templateId === 'executive' ? 1040 : 960,
            cardGap: templateId === 'executive' ? 18 : 24,
        },
        borderShadow: {
            borderRadius: templateId === 'notion' || templateId === 'neon' ? 8 : templateId === 'executive' ? 6 : 12,
            borderWidth: templateId === 'neon' ? 2 : 1,
            shadowIntensity: templateId === 'minimal' || templateId === 'executive' ? 'subtle' : 'medium',
        },
        animations: {},
    };
}
async function seed() {
    await connectDatabase();
    for (const def of TEMPLATE_DEFINITIONS) {
        await TemplateRepository.upsertByTemplateId(def.templateId, {
            ...def,
            defaultDesign: buildDefaultDesign(def.templateId),
            isActive: true,
        });
        console.log(`✅ Seeded template: ${def.name}`);
    }
    console.log('\n🎉 Template seeding complete');
    await disconnectDatabase();
}
seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
