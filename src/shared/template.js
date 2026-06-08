// ============================================================================
// Template Constants - backend runtime defaults derived from the shared registry
// ============================================================================

import { LEGACY_TEMPLATE_MAP, TEMPLATE_REGISTRY } from './template-registry.js';

export const TEMPLATE_COLORS = {};
export const TEMPLATE_TYPOGRAPHY = {};

for (const [id, config] of Object.entries(TEMPLATE_REGISTRY)) {
    TEMPLATE_COLORS[id] = {
        light: config.colors.light,
        dark: config.colors.dark,
    };
    TEMPLATE_TYPOGRAPHY[id] = { ...config.typography };
}

for (const [legacyId, mappedId] of Object.entries(LEGACY_TEMPLATE_MAP)) {
    if (!TEMPLATE_COLORS[legacyId] && TEMPLATE_COLORS[mappedId]) {
        TEMPLATE_COLORS[legacyId] = TEMPLATE_COLORS[mappedId];
        TEMPLATE_TYPOGRAPHY[legacyId] = TEMPLATE_TYPOGRAPHY[mappedId];
    }
}
