// ============================================================================
// Health Routes — /api/health
// ============================================================================
import { Router } from 'express';
import mongoose from 'mongoose';
const router = Router();
/**
 * GET /api/health — Health check endpoint
 */
router.get('/', (_req, res) => {
    const mongoState = mongoose.connection.readyState;
    const mongoStatus = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };
    const healthy = mongoState === 1;
    res.status(healthy ? 200 : 503).json({
        success: healthy,
        data: {
            status: healthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            mongodb: mongoStatus[mongoState] ?? 'unknown',
            environment: process.env.NODE_ENV ?? 'development',
            version: '1.0.0',
        },
    });
});
export default router;
