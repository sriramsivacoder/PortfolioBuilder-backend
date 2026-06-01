// ============================================================================
// AI Generator Prompts — Gemini prompt templates for portfolio generation
// ============================================================================
/**
 * Build the portfolio generation prompt with all available data as context.
 */
export function buildGenerationPrompt(resumeData, githubData, linkedinData) {
    let contextBlock = '';
    // Resume context
    contextBlock += `## Resume Data
Name: ${resumeData.name}
${resumeData.headline ? `Headline: ${resumeData.headline}` : ''}
${resumeData.summary ? `Summary: ${resumeData.summary}` : ''}

Skills:
${resumeData.skills.map((s) => `- ${s.category}: ${s.skills.join(', ')}`).join('\n')}

Experience:
${resumeData.experience
        .map((e) => `- ${e.position} at ${e.company} (${e.startDate ?? '?'} - ${e.current ? 'Present' : e.endDate ?? '?'})\n  ${e.description}${e.highlights?.length ? '\n  Highlights: ' + e.highlights.join('; ') : ''}${e.technologies?.length ? '\n  Tech: ' + e.technologies.join(', ') : ''}`)
        .join('\n')}

Education:
${resumeData.education
        .map((e) => `- ${e.degree}${e.field ? ' in ' + e.field : ''} at ${e.institution} (${e.startDate ?? '?'} - ${e.endDate ?? '?'})${e.gpa ? ', GPA: ' + e.gpa : ''}`)
        .join('\n')}

Projects:
${resumeData.projects
        .map((p) => `- ${p.title}: ${p.description}${p.technologies?.length ? ' [' + p.technologies.join(', ') + ']' : ''}`)
        .join('\n')}

${resumeData.certifications.length > 0 ? `Certifications:\n${resumeData.certifications.map((c) => `- ${c.name} by ${c.issuer}`).join('\n')}` : ''}

Contact: ${JSON.stringify(resumeData.contact)}
`;
    // GitHub context
    if (githubData) {
        contextBlock += `
## GitHub Data
Username: ${githubData.username}
${githubData.bio ? `Bio: ${githubData.bio}` : ''}
Total Stars: ${githubData.totalStars}
Top Languages: ${Object.entries(githubData.languages).sort(([, a], [, b]) => b - a).slice(0, 10).map(([lang, pct]) => `${lang} (${pct}%)`).join(', ')}

Top Repositories:
${githubData.repos.slice(0, 10).map((r) => `- ${r.name}: ${r.description ?? 'No description'} | ⭐ ${r.stars} | ${r.language ?? 'N/A'}${r.topics?.length ? ' | Topics: ' + r.topics.join(', ') : ''}`).join('\n')}
`;
    }
    // LinkedIn context
    if (linkedinData) {
        contextBlock += `
## LinkedIn Data
${linkedinData.headline ? `Headline: ${linkedinData.headline}` : ''}
${linkedinData.summary ? `Summary: ${linkedinData.summary}` : ''}
URL: ${linkedinData.url}
`;
    }
    return `You are an expert portfolio content writer. Using the following professional data, generate compelling portfolio website content. Write in first-person perspective from the person's point of view.

${contextBlock}

Generate a JSON object matching this exact structure:

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
      "featured": true or false
    }
  ],
  "experience": [
    {
      "id": "exp-1",
      "company": "Company Name",
      "position": "Title",
      "startDate": "Date",
      "endDate": "Date or null",
      "current": boolean,
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
3. For experience highlights, try to add quantifiable metrics where reasonable.
4. Keep skills organized into 3-6 logical categories.
5. The "about" section should tell a compelling professional story.
6. Preserve all factual data (dates, company names, school names, etc.) exactly as provided.
7. If GitHub repos exist that aren't in the resume projects, include the most notable ones (top 3-5 by stars).
8. Return ONLY the JSON object, no markdown, no code blocks.`;
}
