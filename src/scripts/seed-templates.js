// ============================================================================
// Seed Templates - populate template documents from the shared registry
// ============================================================================

import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { TemplateRepository } from '../repositories/template.repository.js';
import { LEGACY_TEMPLATE_MAP, TEMPLATE_REGISTRY, TEMPLATE_FAMILIES } from '../shared/template-registry.js';

const FAMILY_CATEGORY_MAP = {
    developer: 'developer',
    student: 'professional',
    'uiux-designer': 'creative',
    'graphic-designer': 'creative',
    freelancer: 'business',
    founder: 'business',
    photographer: 'media',
    'content-creator': 'media',
    researcher: 'academic',
    hybrid: 'professional',
};

function buildDefaultDesign(config) {
    return {
        colors: config.colors.light,
        typography: { ...config.typography },
        spacing: { ...config.spacing },
        borderShadow: { ...config.borderShadow },
        animations: {},
    };
}

async function seed() {
    await connectDatabase();

    for (const config of Object.values(TEMPLATE_REGISTRY)) {
        const familyMeta = TEMPLATE_FAMILIES.find((family) => family.id === config.family);
        await TemplateRepository.upsertByTemplateId(config.id, {
            templateId: config.id,
            name: config.name,
            description: config.description,
            thumbnail: `/templates/${config.id}.png`,
            family: config.family,
            category: FAMILY_CATEGORY_MAP[config.family] ?? 'professional',
            targetAudience: familyMeta?.targetAudience ?? [],
            animationLevel: config.animationLevel,
            defaultSections: config.defaultSections,
            defaultDesign: buildDefaultDesign(config),
            isActive: true,
        });
        console.log(`Seeded template: ${config.id}`);
    }

    for (const [legacyId, mappedId] of Object.entries(LEGACY_TEMPLATE_MAP)) {
        const config = TEMPLATE_REGISTRY[mappedId];
        const familyMeta = TEMPLATE_FAMILIES.find((family) => family.id === config.family);
        await TemplateRepository.upsertByTemplateId(legacyId, {
            templateId: legacyId,
            name: `${config.name} (Legacy)`,
            description: `Legacy alias for ${mappedId}.`,
            thumbnail: `/templates/${mappedId}.png`,
            family: config.family,
            category: FAMILY_CATEGORY_MAP[config.family] ?? 'professional',
            targetAudience: familyMeta?.targetAudience ?? [],
            animationLevel: config.animationLevel,
            defaultSections: config.defaultSections,
            defaultDesign: buildDefaultDesign(config),
            isActive: true,
        });
        console.log(`Seeded legacy alias: ${legacyId} -> ${mappedId}`);
    }

    console.log('\nTemplate seeding complete');
    await disconnectDatabase();
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
