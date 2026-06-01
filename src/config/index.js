import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
    path: path.resolve(__dirname, '../../../.env'),
});
function getEnvVar(key, fallback) {
    const value = process.env[key] ?? fallback;
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
const mongodbUri = getEnvVar('MONGODB_URI');
if (!mongodbUri.startsWith('mongodb')) {
    throw new Error('Invalid MongoDB URI');
}
export const config = {
    port: Number(getEnvVar('PORT', '5000')),
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    mongodbUri,
    geminiApiKey: getEnvVar('GEMINI_API_KEY'),
    cloudinary: {
        cloudName: getEnvVar('CLOUDINARY_CLOUD_NAME'),
        apiKey: getEnvVar('CLOUDINARY_API_KEY'),
        apiSecret: getEnvVar('CLOUDINARY_API_SECRET'),
    },
    githubToken: process.env.GITHUB_TOKEN,
    clientUrl: getEnvVar('CLIENT_URL', 'http://localhost:5173'),
};
