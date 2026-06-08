// ============================================================================
// Profile Classifier — Heuristic-based professional category detection
// ============================================================================

const CATEGORY_SIGNALS = {
  developer: {
    skillKeywords: [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'golang', 'rust',
      'react', 'angular', 'vue', 'node', 'nodejs', 'express', 'django', 'flask', 'spring',
      'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'terraform', 'ci/cd', 'devops',
      'git', 'api', 'rest', 'graphql', 'sql', 'nosql', 'mongodb', 'postgresql',
      'swift', 'kotlin', 'flutter', 'react native', 'ios', 'android',
      'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'llm', 'ai', 'ml',
      'backend', 'frontend', 'full stack', 'fullstack', 'software engineer',
    ],
    titleKeywords: [
      'developer', 'engineer', 'programmer', 'architect', 'devops', 'sre',
      'full stack', 'frontend', 'backend', 'software', 'platform',
    ],
    githubWeight: 30,  // boost when GitHub repos exist
  },

  student: {
    skillKeywords: [
      'coursework', 'academic', 'gpa', 'dean', 'scholar', 'thesis',
    ],
    titleKeywords: [
      'student', 'fresher', 'intern', 'graduate', 'undergraduate', 'btech', 'bsc', 'msc',
    ],
    educationRecencyWeight: 20,  // boost when most recent education is < 2 years old
  },

  'uiux-designer': {
    skillKeywords: [
      'figma', 'sketch', 'adobe xd', 'invision', 'prototyping', 'wireframe',
      'user research', 'usability', 'interaction design', 'design thinking',
      'design system', 'ux', 'ui', 'user experience', 'user interface',
      'information architecture', 'accessibility', 'heuristic',
    ],
    titleKeywords: [
      'ux designer', 'ui designer', 'product designer', 'ux researcher',
      'interaction designer', 'design lead',
    ],
  },

  'graphic-designer': {
    skillKeywords: [
      'photoshop', 'illustrator', 'indesign', 'after effects', 'premiere',
      'branding', 'typography', 'illustration', 'visual design', 'logo',
      'creative suite', 'canva', 'brand identity', 'print design',
      'motion graphics', 'art direction',
    ],
    titleKeywords: [
      'graphic designer', 'visual designer', 'illustrator', 'art director',
      'brand designer', 'creative director',
    ],
  },

  freelancer: {
    skillKeywords: [
      'freelance', 'consulting', 'client', 'contract', 'proposal',
      'self-employed', 'independent', 'hourly',
    ],
    titleKeywords: [
      'freelance', 'consultant', 'independent', 'contractor', 'self-employed',
    ],
  },

  founder: {
    skillKeywords: [
      'startup', 'entrepreneurship', 'fundraising', 'venture', 'pitch',
      'product-market fit', 'mvp', 'scaling', 'growth', 'leadership',
    ],
    titleKeywords: [
      'founder', 'co-founder', 'ceo', 'cto', 'coo', 'entrepreneur',
      'managing director', 'president', 'chief',
    ],
  },

  photographer: {
    skillKeywords: [
      'photography', 'lightroom', 'camera', 'lens', 'portrait', 'landscape',
      'photo editing', 'studio', 'shoot', 'composition', 'exposure',
      'wedding photography', 'event photography',
    ],
    titleKeywords: [
      'photographer', 'cinematographer', 'videographer', 'visual artist',
    ],
  },

  'content-creator': {
    skillKeywords: [
      'youtube', 'video editing', 'content creation', 'social media',
      'blogging', 'podcast', 'streaming', 'tiktok', 'instagram',
      'subscriber', 'audience', 'engagement', 'seo', 'copywriting',
    ],
    titleKeywords: [
      'content creator', 'youtuber', 'blogger', 'influencer', 'podcaster',
      'streamer', 'creator', 'vlogger',
    ],
  },

  researcher: {
    skillKeywords: [
      'research', 'publication', 'paper', 'journal', 'conference',
      'peer-review', 'citation', 'phd', 'thesis', 'dissertation',
      'academic', 'laboratory', 'experiment', 'methodology',
      'data analysis', 'statistics', 'r programming',
    ],
    titleKeywords: [
      'researcher', 'professor', 'scientist', 'academic', 'postdoc',
      'phd', 'faculty', 'lecturer', 'associate professor',
    ],
  },
};

/**
 * Classify a user profile into a professional category.
 *
 * @param {{ resumeData?, githubData?, linkedinData? }} data
 * @returns {{ primaryCategory: string, confidence: number, secondaryCategory: string|null, recommendedTemplates: string[] }}
 */
export function classifyProfile({ resumeData, githubData, linkedinData }) {
  const scores = {};
  for (const category of Object.keys(CATEGORY_SIGNALS)) {
    scores[category] = 0;
  }

  // Gather text signals from all sources
  const allSkills = [];
  const allTitles = [];
  const allText = [];

  if (resumeData) {
    // Skills
    if (Array.isArray(resumeData.skills)) {
      for (const cat of resumeData.skills) {
        if (Array.isArray(cat.skills)) {
          allSkills.push(...cat.skills.map((s) => s.toLowerCase()));
        }
        if (cat.category) allSkills.push(cat.category.toLowerCase());
      }
    }

    // Titles from experience
    if (Array.isArray(resumeData.experience)) {
      for (const exp of resumeData.experience) {
        if (exp.position) allTitles.push(exp.position.toLowerCase());
        if (exp.company) allText.push(exp.company.toLowerCase());
        if (exp.description) allText.push(exp.description.toLowerCase());
      }
    }

    // Education
    if (Array.isArray(resumeData.education)) {
      for (const edu of resumeData.education) {
        if (edu.degree) allText.push(edu.degree.toLowerCase());
        if (edu.field) allText.push(edu.field.toLowerCase());
      }
    }

    // Headline / Summary
    if (resumeData.headline) allTitles.push(resumeData.headline.toLowerCase());
    if (resumeData.summary) allText.push(resumeData.summary.toLowerCase());
    if (resumeData.name) allText.push(resumeData.name.toLowerCase());
  }

  // LinkedIn signals
  if (linkedinData) {
    if (linkedinData.headline) allTitles.push(linkedinData.headline.toLowerCase());
    if (linkedinData.summary) allText.push(linkedinData.summary.toLowerCase());
  }

  // GitHub signals — strong developer signal
  if (githubData) {
    if (githubData.repos && githubData.repos.length > 0) {
      scores.developer += CATEGORY_SIGNALS.developer.githubWeight;
    }
    if (githubData.bio) allText.push(githubData.bio.toLowerCase());
    // Languages as skills
    if (githubData.languages) {
      allSkills.push(...Object.keys(githubData.languages).map((l) => l.toLowerCase()));
    }
  }

  const allTextJoined = allText.join(' ');

  // Score each category
  for (const [category, signals] of Object.entries(CATEGORY_SIGNALS)) {
    // Skill keyword matches
    for (const keyword of signals.skillKeywords) {
      for (const skill of allSkills) {
        if (skill.includes(keyword)) {
          scores[category] += 3;
        }
      }
      if (allTextJoined.includes(keyword)) {
        scores[category] += 1;
      }
    }

    // Title keyword matches (higher weight)
    for (const keyword of signals.titleKeywords) {
      for (const title of allTitles) {
        if (title.includes(keyword)) {
          scores[category] += 8;
        }
      }
    }
  }

  // Student recency boost: if the most recent education ends within 2 years
  if (resumeData?.education?.length) {
    const now = new Date().getFullYear();
    const recentEdu = resumeData.education.some((edu) => {
      const endYear = parseInt(edu.endDate, 10);
      return endYear && (endYear >= now - 1);
    });
    if (recentEdu) {
      scores.student += CATEGORY_SIGNALS.student.educationRecencyWeight;
    }
  }

  // Sort by score descending
  const sorted = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a);

  if (sorted.length === 0) {
    return {
      primaryCategory: 'hybrid',
      confidence: 0,
      secondaryCategory: null,
      recommendedTemplates: ['hybrid-flex'],
    };
  }

  const [primaryCategory, primaryScore] = sorted[0];
  const totalScore = sorted.reduce((sum, [, score]) => sum + score, 0);
  const confidence = Math.min(Math.round((primaryScore / Math.max(totalScore, 1)) * 100), 100);

  const secondaryCategory =
    sorted.length > 1 && sorted[1][1] > primaryScore * 0.4
      ? sorted[1][0]
      : null;

  // If two categories are close, suggest hybrid
  const isHybrid = secondaryCategory && sorted[1][1] > primaryScore * 0.7;

  // Build recommended templates — primary first, then secondary if hybrid-ish
  const templateMap = {
    developer: ['dev-terminal', 'dev-minimal'],
    student: ['student-modern', 'student-campus'],
    'uiux-designer': ['designer-casestudy', 'designer-showcase'],
    'graphic-designer': ['graphic-masonry', 'graphic-spotlight'],
    freelancer: ['freelancer-convert', 'freelancer-agency'],
    founder: ['founder-executive', 'founder-timeline'],
    photographer: ['photo-gallery', 'photo-story'],
    'content-creator': ['creator-media', 'creator-hub'],
    researcher: ['researcher-academic', 'researcher-modern'],
    hybrid: ['hybrid-flex'],
  };

  const recommendedTemplates = [
    ...(templateMap[primaryCategory] ?? []),
    ...(isHybrid ? ['hybrid-flex'] : []),
    ...(secondaryCategory && !isHybrid ? (templateMap[secondaryCategory] ?? []).slice(0, 1) : []),
  ];

  return {
    primaryCategory: isHybrid ? 'hybrid' : primaryCategory,
    confidence,
    secondaryCategory: isHybrid ? primaryCategory : secondaryCategory,
    recommendedTemplates,
  };
}
