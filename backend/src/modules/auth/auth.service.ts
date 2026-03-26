import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

import type { AuthUser, RoleName } from '@music-chords/shared';

import { query } from '../../config/db.js';
import { env, isProduction } from '../../config/env.js';
import { AppError } from '../../utils/http.js';
import { comparePassword } from '../../utils/security.js';
import { AUTH_COOKIE_NAME } from '../../middleware/auth.js';

interface UserRow {
  id: number;
  email: string;
  display_name: string;
  password_hash: string;
  role: RoleName;
}

export interface CookieOptions {
  httpOnly: boolean;
  sameSite: 'lax';
  secure: boolean;
  maxAge: number;
  path: string;
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser> {
  const result = await query<UserRow>(
    `SELECT u.id, u.email, u.display_name, u.password_hash, r.name AS role
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id
     WHERE LOWER(u.email) = LOWER($1)`,
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const passwordMatches = await comparePassword(password, user.password_hash);

  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    role: user.role
  };
}

export function signAuthToken(user: AuthUser) {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] });
}

export function getAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  };
}

export function clearAuthCookie() {
  return {
    ...getAuthCookieOptions(),
    maxAge: 0
  };
}

export { AUTH_COOKIE_NAME };
