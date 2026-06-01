// ============================================================================
// Session Middleware — Anonymous session via x-session-id header
// ============================================================================
import { v4 as uuidv4 } from 'uuid';
/**
 * Reads `x-session-id` header or generates a new UUID.
 * Attaches sessionId to req and sets it in the response header.
 */
export function sessionMiddleware(req, _res, next) {
    const headerValue = req.headers['x-session-id'];
    const sessionId = typeof headerValue === 'string' && headerValue.trim().length > 0
        ? headerValue.trim()
        : uuidv4();
    // Attach to request object (typed via our SessionRequest interface)
    req.sessionId = sessionId;
    // Set response header so client knows the session ID
    _res.setHeader('x-session-id', sessionId);
    next();
}
