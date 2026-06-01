// ============================================================================
// Publish Validators — Zod 4 schemas
// ============================================================================
import { z } from 'zod';
export const publishSchema = z.object({
    slug: z
        .string()
        .min(3, 'Slug must be at least 3 characters')
        .max(60, 'Slug must be at most 60 characters')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens, cannot start or end with a hyphen'),
});
