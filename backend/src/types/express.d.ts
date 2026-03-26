import type { AuthUser, RoleName } from '@music-chords/shared';

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
      authRole?: RoleName;
    }
  }
}

export {};
