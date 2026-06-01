// ============================================================================
// Resume Parser Service — Orchestrates PDF/DOCX parsing + AI extraction
// ============================================================================
import { parsePdf } from './pdf-parser.js';
import { parseDocx } from './docx-parser.js';
import { extractResumeData } from './extractor.js';
import { ServiceError } from '../../types/index.js';
const SUPPORTED_MIME_TYPES = new Map([
    ['application/pdf', parsePdf],
    ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', parseDocx],
]);
/**
 * Parse a resume file buffer and extract structured data.
 *
 * 1. Detects file type from MIME type
 * 2. Extracts raw text from the file
 * 3. Uses Gemini AI to structure the data
 */
export async function parseResume(buffer, mimeType) {
    // Validate MIME type
    const parser = SUPPORTED_MIME_TYPES.get(mimeType);
    if (!parser) {
        throw new ServiceError(`Unsupported file type: ${mimeType}. Only PDF and DOCX are supported.`, 400);
    }
    // Step 1: Extract raw text
    let rawText;
    try {
        rawText = await parser(buffer);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown parsing error';
        throw new ServiceError(`Failed to extract text from resume: ${message}`, 422);
    }
    // Validate we got meaningful content
    if (rawText.length < 50) {
        throw new ServiceError('Resume appears too short or could not be read properly. Please ensure the file contains text content.', 422);
    }
    // Step 2: Extract structured data using AI
    try {
        const resumeData = await extractResumeData(rawText);
        return resumeData;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown extraction error';
        throw new ServiceError(`Failed to extract structured data from resume: ${message}`, 500);
    }
}
