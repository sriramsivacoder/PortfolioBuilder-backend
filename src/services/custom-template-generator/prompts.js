// ============================================================================
// Custom Template Generator — AI-powered template configuration generation
// ============================================================================

/**
 * Build a prompt that generates a complete template design configuration
 * from a user's natural language description.
 */
export function buildCustomTemplatePrompt(userPrompt) {
  return `You are an expert web designer specializing in portfolio websites. A user wants to create a custom portfolio template based on the following description:

"${userPrompt}"

Generate a complete design configuration as a JSON object with the following structure. Choose colors, typography, spacing, and visual settings that match the user's description. Be creative and make the design feel premium and cohesive.

{
  "colors": {
    "primary": "#hex — main heading / logo color",
    "secondary": "#hex — secondary text color",
    "accent": "#hex — accent / highlight color, buttons, links",
    "background": "#hex — page background",
    "surface": "#hex — card / section background",
    "text": "#hex — main body text",
    "textSecondary": "#hex — muted text",
    "border": "#hex — borders and dividers"
  },
  "typography": {
    "headingFont": "'Font Name', fallback — Choose from: Inter, Outfit, JetBrains Mono, Playfair Display, DM Sans, Space Grotesk, Syne, EB Garamond",
    "bodyFont": "'Font Name', fallback — Choose from: Inter, Outfit",
    "headingWeight": 700,
    "bodyWeight": 400,
    "baseSize": 16,
    "lineHeight": 1.6,
    "letterSpacing": 0
  },
  "spacing": {
    "sectionPadding": 64,
    "contentMaxWidth": 1060,
    "cardGap": 24
  },
  "borderShadow": {
    "borderRadius": 12,
    "borderWidth": 1,
    "shadowIntensity": "medium"
  },
  "suggestedSections": ["hero", "about", "skills", "projects", "experience", "education", "contact"],
  "designNotes": "Brief description of the design choices and how they match the user's request"
}

Rules:
1. Colors must be valid hex codes and create a visually harmonious palette.
2. Ensure sufficient contrast between text and background colors.
3. The "accent" color should be vibrant and attention-grabbing.
4. Typography fonts MUST be from the allowed list above.
5. shadowIntensity must be one of: "none", "subtle", "medium", "strong".
6. suggestedSections should be relevant to the style (e.g., include "gallery" for visual styles, "publications" for academic styles).
7. Return ONLY the JSON object, no markdown, no code blocks.`;
}
