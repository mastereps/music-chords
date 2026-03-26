export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

interface DatabaseErrorLike {
  code?: string;
  constraint?: string;
  detail?: string;
}

export function toAppError(error: unknown): AppError | null {
  const databaseError = error as DatabaseErrorLike | undefined;

  if (!databaseError?.code) {
    return null;
  }

  if (databaseError.code === '23505') {
    const constraint = databaseError.constraint ?? 'record';

    if (constraint.includes('slug')) {
      return new AppError('That slug is already in use.', 409);
    }

    if (constraint.includes('email')) {
      return new AppError('That email address is already in use.', 409);
    }

    return new AppError('That record already exists.', 409);
  }

  if (databaseError.code === '23503') {
    return new AppError('A related record was not found or cannot be removed yet.', 400, databaseError.detail);
  }

  if (databaseError.code === '22P02') {
    return new AppError('One of the provided values has an invalid format.', 400);
  }

  return null;
}

export function assertFound<T>(value: T | null | undefined, message: string): T {
  if (value == null) {
    throw new AppError(message, 404);
  }

  return value;
}
