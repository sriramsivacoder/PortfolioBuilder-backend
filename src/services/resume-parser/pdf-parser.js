// ============================================================================
// PDF Parser — Extract text from PDF using pdf-parse
// ============================================================================
import { PDFParse } from 'pdf-parse';
export async function parsePdf(buffer) {
    try {
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        await parser.destroy();
        if (!result.text || result.text.trim().length === 0) {
            throw new Error('PDF appears to be empty or contains only images/scanned content');
        }
        return result.text.trim();
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to parse PDF: ${error.message}`);
        }
        throw new Error('Failed to parse PDF: Unknown error');
    }
}
