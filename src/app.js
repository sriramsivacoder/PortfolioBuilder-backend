// ============================================================================
// Express Application — Middleware and route mounting
// ============================================================================
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config/index.js';
import { sessionMiddleware } from './middleware/session.js';
import { errorHandler } from './middleware/error-handler.js';
import portfolioRoutes from './api/portfolio/routes.js';
import templateRoutes from './api/template/routes.js';
import draftRoutes from './api/draft/routes.js';
import publishRoutes from './api/publish/routes.js';
import mediaRoutes from './api/media/routes.js';
import healthRoutes from './api/health/routes.js';
import seoRoutes from './api/seo/routes.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export function createApp() {
    const app = express();
    app.use(cors({
        origin: config.clientUrl,
        credentials: true,
        exposedHeaders: ['x-session-id'],
    }));
    app.use(express.json({ limit: '2mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(sessionMiddleware);
    app.use('/api/health', healthRoutes);
    app.use('/api/portfolio', portfolioRoutes);
    app.use('/api/templates', templateRoutes);
    app.use('/api/drafts', draftRoutes);
    app.use('/api/publish', publishRoutes);
    app.use('/api/media', mediaRoutes);
    app.use('/api/seo', seoRoutes);
    // Serve client build in production
    if (config.nodeEnv === 'production') {
    const clientDist = path.resolve(__dirname, '../../frontend/dist');
        app.use(express.static(clientDist));
        app.get('*', (_req, res) => {
            res.sendFile(path.join(clientDist, 'index.html'));
        });
    }
    app.use(errorHandler);
    return app;
}
