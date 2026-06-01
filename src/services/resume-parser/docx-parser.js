// ============================================================================
// DOCX Parser — Extract text from DOCX using mammoth
// ============================================================================
import mammoth from 'mammoth';
/**
 * Parse a DOCX buffer and extract raw text content.
 */
export async function parseDocx(buffer) {
    try {
        const result = await mammoth.extractRawText({ buffer });
        if (!result.value || result.value.trim().length === 0) {
            throw new Error('DOCX document appears to be empty');
        }
        if (result.messages && result.messages.length > 0) {
            const warnings = result.messages
                .filter((m) => m.type === 'warning')
                .map((m) => m.message);
            if (warnings.length > 0) {
                console.warn('[DOCX Parser] Warnings:', warnings.join('; '));
            }
        }
        return result.value.trim();
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to parse DOCX: ${error.message}`);
        }
        throw new Error('Failed to parse DOCX: Unknown error');
    }
}
