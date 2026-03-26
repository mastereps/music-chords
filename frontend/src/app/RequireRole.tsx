import { Navigate, useLocation } from 'react-router-dom';

import type { RoleName } from '@music-chords/shared';

import { useAuth } from './AuthProvider';

export function RequireRole({
  allowedRoles,
  children
}: {
  allowedRoles: RoleName[];
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="px-4 py-10 text-sm text-stone-500">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
