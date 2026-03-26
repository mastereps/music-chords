import type { Request, Response } from 'express';

import { AppError } from '../../utils/http.js';
import { loginSchema } from './auth.schemas.js';
import {
  authenticateUser,
  AUTH_COOKIE_NAME,
  clearAuthCookie,
  getAuthCookieOptions,
  signAuthToken
} from './auth.service.js';

export async function login(req: Request, res: Response) {
  const payload = loginSchema.parse(req.body);
  const user = await authenticateUser(payload.email, payload.password);
  const token = signAuthToken(user);

  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
  res.status(200).json({ user });
}

export async function me(req: Request, res: Response) {
  if (!req.authUser) {
    throw new AppError('Not authenticated', 401);
  }

  res.status(200).json({ user: req.authUser });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookie());
  res.status(200).json({ message: 'Logged out' });
}
