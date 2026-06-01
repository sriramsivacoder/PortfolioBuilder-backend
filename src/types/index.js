// ============================================================================
// Server-Specific Types — Express extensions and server-only types
// ============================================================================
/** Service error with status code */
export class ServiceError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = 'ServiceError';
        Object.setPrototypeOf(this, ServiceError.prototype);
    }
}
