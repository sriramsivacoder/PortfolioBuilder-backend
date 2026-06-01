// ============================================================================
// Error Handler Middleware — Consistent API error responses
// ============================================================================
import mongoose from 'mongoose';
import { z } from 'zod';
import { ServiceError } from '../types/index.js';
/**
 * Global error handler middleware.
 * Converts various error types into consistent ApiResponse format.
 */
export function errorHandler(err, _req, res, _next) {
    console.error(`[Error] ${err.name}: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    // Service errors (our custom errors with status codes)
    if (err instanceof ServiceError) {
        const response = {
            success: false,
            error: err.message,
        };
        res.status(err.statusCode).json(response);
        return;
    }
    // Zod validation errors
    if (err instanceof z.ZodError) {
        const formattedErrors = err.issues.map((issue) => {
            const path = issue.path.join('.');
            return path ? `${path}: ${issue.message}` : issue.message;
        });
        const response = {
            success: false,
            error: 'Validation failed',
            message: formattedErrors.join('; '),
        };
        res.status(400).json(response);
        return;
    }
    // Mongoose validation errors
    if (err instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(err.errors).map((e) => e.message);
        const response = {
            success: false,
            error: 'Validation failed',
            message: messages.join('; '),
        };
        res.status(400).json(response);
        return;
    }
    // Mongoose cast errors (invalid ObjectId, etc.)
    if (err instanceof mongoose.Error.CastError) {
        const response = {
            success: false,
            error: `Invalid ${err.path}: ${String(err.value)}`,
        };
        res.status(400).json(response);
        return;
    }
    // Mongoose duplicate key errors
    if (err.name === 'MongoServerError' && err.code === 11000) {
        const keyValue = err.keyValue;
        const field = keyValue ? Object.keys(keyValue).join(', ') : 'field';
        const response = {
            success: false,
            error: `Duplicate value for ${field}`,
        };
        res.status(409).json(response);
        return;
    }
    // Multer errors
    if (err.name === 'MulterError') {
        const multerErr = err;
        let message = 'File upload error';
        let statusCode = 400;
        switch (multerErr.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'File too large';
                statusCode = 413;
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Too many files';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected file field';
                break;
            default:
                message = multerErr.message;
        }
        const response = {
            success: false,
            error: message,
        };
        res.status(statusCode).json(response);
        return;
    }
    // Generic fallback
    const response = {
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message || 'Internal server error',
    };
    res.status(500).json(response);
}
