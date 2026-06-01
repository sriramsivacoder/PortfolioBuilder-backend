// ============================================================================
// Database — Mongoose connection with retry logic
// ============================================================================
import mongoose from 'mongoose';
import { config } from './index.js';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;
export async function connectDatabase() {
    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            await mongoose.connect(config.mongodbUri, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            });
            console.log('✅ Connected to MongoDB');
            mongoose.connection.on('error', (err) => {
                console.error('❌ MongoDB connection error:', err.message);
            });
            mongoose.connection.on('disconnected', () => {
                console.warn('⚠️ MongoDB disconnected. Attempting reconnection...');
            });
            mongoose.connection.on('reconnected', () => {
                console.log('✅ MongoDB reconnected');
            });
            return;
        }
        catch (error) {
            retries++;
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ MongoDB connection attempt ${retries}/${MAX_RETRIES} failed: ${message}`);
            if (retries >= MAX_RETRIES) {
                throw new Error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${message}`);
            }
            console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
    }
}
export async function disconnectDatabase() {
    try {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error disconnecting from MongoDB: ${message}`);
    }
}
