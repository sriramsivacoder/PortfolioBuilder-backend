// ============================================================================
// Server Entry — Bootstrap Express and MongoDB
// ============================================================================
import { createApp } from './app.js';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';
async function bootstrap() {
    try {
        await connectDatabase();
        const app = createApp();
        app.listen(config.port, () => {
            console.log(`🚀 PortfolioForge API running on http://localhost:${config.port}`);
            console.log(`   Environment: ${config.nodeEnv}`);
            console.log(`   Client URL:  ${config.clientUrl}`);
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Failed to start server: ${message}`);
        process.exit(1);
    }
}
bootstrap();
