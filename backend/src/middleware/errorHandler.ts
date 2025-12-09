import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { config } from '../config/environment';

/**
 * Global error handler middleware
 * Following Express.js best practices for error handling
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Set CORS headers for error responses
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(config.nodeEnv === 'development' && { stack: err.stack }),
      },
    });
    return;
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: {
        message: err.message,
        ...(config.nodeEnv === 'development' && { stack: err.stack }),
      },
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
      },
    });
    return;
  }

  // Handle CORS errors
  if (err.message.includes('CORS') || err.message.includes('Not allowed by CORS')) {
    res.status(403).json({
      success: false,
      error: {
        message: 'CORS policy violation. Origin not allowed.',
        ...(config.nodeEnv === 'development' && { 
          details: `Requested origin: ${req.headers.origin || 'none'}` 
        }),
      },
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      message: config.nodeEnv === 'production' 
        ? 'Internal server error' 
        : err.message,
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    },
  });
};

/**
 * Async error wrapper to catch errors in async route handlers
 * Following Node.js best practices
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
