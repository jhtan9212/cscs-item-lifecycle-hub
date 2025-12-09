import { Response } from 'express';

/**
 * Standardized API response utility
 * Following REST API best practices (Microsoft/Google guidelines)
 */

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(details && { details }),
    },
  };
  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
): Response => {
  return sendSuccess(res, data, 200, {
    page,
    limit,
    total,
  });
};

