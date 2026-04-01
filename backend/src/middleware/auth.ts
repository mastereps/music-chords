import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import type { AuthUser, RoleName } from '@music-chords/shared';

import { env } from '../config/env';
import { AppError } from '../utils/http';

export const AUTH_COOKIE_NAME = 'music_chords_token';

type TokenPayload = AuthUser & { role: RoleName };

function parseToken(req: Request) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    return null;
  }

  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function attachAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const payload = parseToken(req);

    if (payload) {
      req.authUser = payload;
      req.authRole = payload.role;
    }

    next();
  } catch {
    next();
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.authUser || !req.authRole) {
    next(new AppError('Authentication required', 401));
    return;
  }

  next();
}

export function requireRole(...roles: RoleName[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authRole || !roles.includes(req.authRole)) {
      next(new AppError('You do not have permission for this action', 403));
      return;
    }

    next();
  };
}
