import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { logger } from '../config/logger.js';
import { AppError, toAppError } from '../utils/http.js';

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      errors: error.flatten()
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
    return;
  }

  const normalizedError = toAppError(error);

  if (normalizedError) {
    res.status(normalizedError.statusCode).json({
      message: normalizedError.message,
      details: normalizedError.details
    });
    return;
  }

  const err = error as Error;
  logger.error('Unhandled request error', {
    path: req.path,
    method: req.method,
    error: err?.message ?? 'Unknown error'
  });

  res.status(500).json({
    message: 'Internal server error'
  });
}
