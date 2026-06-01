// ============================================================================
// Resume Data Extractor — Use Gemini AI to extract structured data from text
// ============================================================================
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/index.js';
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const EXTRACTION_PROMPT = `You are an expert resume parser. Extract structured information from the following resume text and return it as a JSON object.

The JSON must conform to this exact structure:

{
  "name": "Full Name (required)",
  "headline": "Professional headline or title",
  "summary": "Professional summary or objective",
  "skills": [
    {
      "id": "unique-id-string",
      "category": "Category Name (e.g., Programming Languages, Frameworks, Tools)",
      "skills": ["Skill1", "Skill2"]
    }
  ],
  "education": [
    {
      "id": "unique-id-string",
      "institution": "University/School Name",
      "degree": "Degree Name",
      "field": "Field of Study",
      "startDate": "YYYY or YYYY-MM",
      "endDate": "YYYY or YYYY-MM or Present",
      "description": "Additional details",
      "gpa": "GPA if mentioned"
    }
  ],
  "experience": [
    {
      "id": "unique-id-string",
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or null if current",
      "current": false,
      "description": "Role description",
      "highlights": ["Key achievement 1", "Key achievement 2"],
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "projects": [
    {
      "id": "unique-id-string",
      "title": "Project Name",
      "description": "Project description",
      "technologies": ["Tech1", "Tech2"],
      "url": "Project URL if available",
      "githubUrl": "GitHub URL if available"
    }
  ],
  "certifications": [
    {
      "id": "unique-id-string",
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Date obtained",
      "url": "Verification URL if available",
      "credentialId": "Credential ID if available"
    }
  ],
  "contact": {
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, State/Country",
    "website": "personal website URL",
    "linkedin": "LinkedIn URL",
    "github": "GitHub URL or username"
  }
}

Rules:
1. Generate unique IDs for each entry (use format like "edu-1", "exp-1", "proj-1", "cert-1", "skill-1").
2. If a field is not found in the resume, omit it or use null.
3. Group skills into logical categories.
4. For experience, extract bullet points as highlights and identify technologies mentioned.
5. Set "current" to true for the most recent job if no end date is specified.
6. Always extract GitHub and LinkedIn from headers, footers, or contact sections into contact.github and contact.linkedin (full URL or username).
7. Return ONLY the JSON object, no markdown formatting, no code blocks, no explanatory text.

Resume text:
`;
/**
 * Extract structured ResumeData from raw text using Gemini AI.
 */
export async function extractResumeData(rawText) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.1,
                topP: 0.8,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json',
            },
        });
        const prompt = EXTRACTION_PROMPT + rawText;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        if (!text) {
            throw new Error('Gemini returned an empty response');
        }
        // Parse the JSON response
        const parsed = JSON.parse(text);
        // Validate minimum required fields
        if (!parsed.name || typeof parsed.name !== 'string') {
            throw new Error('Failed to extract name from resume');
        }
        // Ensure arrays exist even if empty
        return {
            name: parsed.name,
            headline: parsed.headline ?? undefined,
            summary: parsed.summary ?? undefined,
            skills: Array.isArray(parsed.skills) ? parsed.skills : [],
            education: Array.isArray(parsed.education) ? parsed.education : [],
            experience: Array.isArray(parsed.experience) ? parsed.experience : [],
            projects: Array.isArray(parsed.projects) ? parsed.projects : [],
            certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
            contact: parsed.contact ?? {},
        };
    }
    catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error('Failed to parse AI response as JSON. The resume may be in an unsupported format.');
        }
        if (error instanceof Error) {
            throw new Error(`Resume extraction failed: ${error.message}`);
        }
        throw new Error('Resume extraction failed: Unknown error');
    }
}
