// ============================================================================
// AI Generator Prompts - Gemini prompt templates for portfolio generation
// ============================================================================

const CATEGORY_TONE = {
  developer: 'Write in a concise, technical style. Emphasise problem-solving skills, technology expertise, and quantifiable engineering impact. Use active voice and avoid buzzwords.',
  student: 'Write in an enthusiastic, forward-looking tone. Highlight potential, eagerness to learn, academic achievements, and extracurricular projects. Keep it professional but energetic.',
  'uiux-designer': 'Write in a design-thinking-oriented style. Emphasise user empathy, research-driven decisions, and measurable UX outcomes. Reference design processes and tools.',
  'graphic-designer': 'Write in a visually expressive, portfolio-centric style. Let the work speak - keep descriptions brief but impactful. Emphasise creative vision and brand storytelling.',
  freelancer: 'Write in a client-conversion-focused style. Emphasise trust signals, results delivered, and the value proposition. Include calls to action and social proof.',
  founder: 'Write in a leadership and authority-building style. Emphasise vision, scaling milestones, fundraising achievements, and team building. Premium, executive tone.',
  photographer: 'Write in a minimal, image-first style. Keep text sparse and atmospheric. Focus on artistic vision, technical craft, and notable clients/exhibitions.',
  'content-creator': 'Write in an engaging, audience-building style. Emphasise content reach, subscriber milestones, platform presence, and community engagement.',
  researcher: 'Write in a formal academic style. Emphasise publications, citations, grants, research impact, and scholarly contributions. Use precise, authoritative language.',
  hybrid: 'Write in a balanced professional style that bridges multiple disciplines. Adapt tone to the dominant expertise while acknowledging the breadth of skills.',
};

const SECTION_GENERATION_HINTS = {
  'github-stats': `If GitHub data is available, generate a "githubStats" object with { totalStars, totalRepos, topLanguages, contributionLevel }.`,
  'tech-stack': `Use the standard "skills" structure, but organise it like a technical stack with strong category names such as Frontend, Backend, DevOps, Data, and Tooling.`,
  services: `Generate a "services" array: [{ id, title, description, icon (emoji), price (optional string like "From $500") }]. Create 3-5 service offerings based on the profile.`,
  testimonials: `Generate a "testimonials" array: [{ id, name, company, role, quote }]. Create 2-3 realistic but clearly placeholder testimonials that the user should replace.`,
  publications: `Generate a "publications" array: [{ id, title, journal, year, coAuthors, url, citations }]. Only generate if research or academic signals exist in the data.`,
  timeline: `Generate a "timeline" array: [{ id, date, title, description, icon (emoji) }]. Create 4-6 key milestones in chronological order.`,
  gallery: `Generate a "gallery" array: [{ id, imageUrl (use "placeholder"), title, category }]. Create 4-6 placeholder gallery items the user should replace with their own work.`,
  'media-showcase': `Generate a "mediaShowcase" array: [{ id, title, type ("video"|"podcast"|"blog"), url, thumbnailUrl (use "placeholder"), description }]. Create 3-5 content items.`,
  'case-studies': `Generate a "caseStudies" array: [{ id, title, problem, process (array of 2-4 short steps), solution, outcome, imageUrl (use "placeholder"), tools, url }]. Create 2-3 case studies based on the profile's projects or experience.`,
  'social-proof': `Generate a "socialProof" object with { clients: [{ name, logoUrl }], metrics: [{ label, value }], press: [{ title, source, url }], awards: [{ title, year }] }. Include only the groups that fit the profile.`,
};

export function buildGenerationPrompt(profileData, githubData, linkedinData, options = {}) {
  const { professionalCategory, sectionTypes } = options;
  const skills = Array.isArray(profileData.skills) ? profileData.skills : [];
  const experience = Array.isArray(profileData.experience) ? profileData.experience : [];
  const education = Array.isArray(profileData.education) ? profileData.education : [];
  const projects = Array.isArray(profileData.projects) ? profileData.projects : [];
  const certifications = Array.isArray(profileData.certifications) ? profileData.certifications : [];

  let contextBlock = `## Available Profile Data
Name: ${profileData.name}
${profileData.headline ? `Headline: ${profileData.headline}` : ''}
${profileData.summary ? `Summary: ${profileData.summary}` : ''}

Skills:
${skills.length ? skills.map((s) => `- ${s.category}: ${(s.skills ?? []).join(', ')}`).join('\n') : 'No explicit skills provided.'}

Experience:
${experience.length
    ? experience
        .map((e) => `- ${e.position} at ${e.company} (${e.startDate ?? '?'} - ${e.current ? 'Present' : e.endDate ?? '?'})\n  ${e.description}${e.highlights?.length ? '\n  Highlights: ' + e.highlights.join('; ') : ''}${e.technologies?.length ? '\n  Tech: ' + e.technologies.join(', ') : ''}`)
        .join('\n')
    : 'No explicit experience provided.'}

Education:
${education.length
    ? education
        .map((e) => `- ${e.degree}${e.field ? ' in ' + e.field : ''} at ${e.institution} (${e.startDate ?? '?'} - ${e.endDate ?? '?'})${e.gpa ? ', GPA: ' + e.gpa : ''}`)
        .join('\n')
    : 'No explicit education provided.'}

Projects:
${projects.length
    ? projects
        .map((p) => `- ${p.title}: ${p.description}${p.technologies?.length ? ' [' + p.technologies.join(', ') + ']' : ''}`)
        .join('\n')
    : 'No explicit projects provided.'}

${certifications.length > 0 ? `Certifications:\n${certifications.map((c) => `- ${c.name} by ${c.issuer}`).join('\n')}` : ''}

Contact: ${JSON.stringify(profileData.contact ?? {})}
`;

  if (githubData) {
    contextBlock += `
## GitHub Data
Username: ${githubData.username}
${githubData.bio ? `Bio: ${githubData.bio}` : ''}
Total Stars: ${githubData.totalStars}
Top Languages: ${Object.entries(githubData.languages ?? {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([lang, pct]) => `${lang} (${pct}%)`)
      .join(', ')}

Top Repositories:
${(githubData.repos ?? [])
      .slice(0, 10)
      .map((r) => `- ${r.name}: ${r.description ?? 'No description'} | stars ${r.stars} | ${r.language ?? 'N/A'}${r.topics?.length ? ' | Topics: ' + r.topics.join(', ') : ''}`)
      .join('\n')}
`;
  }

  if (linkedinData) {
    contextBlock += `
## LinkedIn Data
${linkedinData.headline ? `Headline: ${linkedinData.headline}` : ''}
${linkedinData.summary ? `Summary: ${linkedinData.summary}` : ''}
URL: ${linkedinData.url}
`;
  }

  const toneGuidance =
    professionalCategory && CATEGORY_TONE[professionalCategory]
      ? `\n## Professional Category: ${professionalCategory}\n${CATEGORY_TONE[professionalCategory]}\n`
      : '';

  let sectionHints = '';
  if (sectionTypes?.length) {
    const extraSections = sectionTypes.filter((type) => SECTION_GENERATION_HINTS[type]);
    if (extraSections.length > 0) {
      sectionHints =
        '\n## Additional Section Content to Generate\n' +
        extraSections.map((type) => `- ${type}: ${SECTION_GENERATION_HINTS[type]}`).join('\n') +
        '\n';
    }
  }

  return `You are an expert portfolio content writer. Using the following professional data, generate compelling portfolio website content. Write in first-person perspective from the person's point of view.
${toneGuidance}
${contextBlock}
${sectionHints}
Generate a JSON object matching this exact base structure:

{
  "hero": {
    "title": "A compelling greeting or name display (e.g., 'Hi, I'm [Name]')",
    "subtitle": "A professional subtitle that captures their expertise (1-2 sentences)",
    "tagline": "A short catchy tagline or motto",
    "ctaText": "Call to action button text (e.g., 'View My Work', 'Get In Touch')",
    "ctaUrl": "#projects",
    "backgroundStyle": "gradient"
  },
  "about": {
    "heading": "About Me",
    "paragraphs": [
      "First paragraph: Professional introduction and passion (2-3 sentences)",
      "Second paragraph: Key expertise and what they bring to the table (2-3 sentences)",
      "Third paragraph: Professional philosophy or what drives them (1-2 sentences)"
    ],
    "highlights": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4"]
  },
  "skills": [
    {
      "id": "skill-cat-1",
      "category": "Category Name",
      "skills": ["Skill1", "Skill2"]
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "title": "Project Name",
      "description": "Enhanced 2-3 sentence description highlighting impact and technologies",
      "technologies": ["Tech1", "Tech2"],
      "url": "project URL if available",
      "githubUrl": "github URL if available",
      "featured": true
    }
  ],
  "experience": [
    {
      "id": "exp-1",
      "company": "Company Name",
      "position": "Title",
      "startDate": "Date",
      "endDate": "Date or null",
      "current": false,
      "description": "Enhanced role description (2-3 sentences focusing on impact)",
      "highlights": ["Achievement with metrics", "Another achievement"],
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "institution": "Name",
      "degree": "Degree",
      "field": "Field",
      "startDate": "Date",
      "endDate": "Date",
      "description": "Brief description or relevant coursework"
    }
  ],
  "certifications": [
    {
      "id": "cert-1",
      "name": "Name",
      "issuer": "Issuer",
      "date": "Date"
    }
  ],
  "contact": {
    "email": "email",
    "phone": "phone",
    "location": "location",
    "website": "website",
    "linkedin": "linkedin URL",
    "github": "github URL"
  }
}

Rules:
1. Write engaging, professional copy. Enhance descriptions but keep them authentic.
2. For projects, if GitHub data is available, merge and enhance project descriptions. Feature the top starred repos.
3. For experience highlights, add quantifiable metrics where reasonable.
4. Keep skills organised into 3-6 logical categories.
5. The about section should tell a compelling professional story.
6. Preserve all factual data (dates, company names, school names, and similar facts) exactly as provided.
7. If GitHub repos exist that are not already in the resume projects, include the most notable ones (top 3-5 by stars).
8. If a data source is missing, omit that section's items or create editable placeholder copy only when needed for hero or about.
9. If "Additional Section Content" instructions are present, include those extra top-level fields in the same JSON object.
10. Return ONLY the JSON object, with no markdown and no code fences.${professionalCategory ? `\n11. Tailor the tone and emphasis for a ${professionalCategory} portfolio. ${CATEGORY_TONE[professionalCategory] ?? ''}` : ''}`;
}
