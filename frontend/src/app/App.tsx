import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './AuthProvider';
import { AppLayout } from '../components/AppLayout';
import { RequireRole } from './RequireRole';
import { CategoryManagerPage } from '../features/categories/CategoryManagerPage';
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage';
import { LineupProvider } from '../features/lineups/LineupProvider';
import { LineupPage } from '../features/lineups/LineupPage';
import { LineupsPage } from '../features/lineups/LineupsPage';
import { SongEditorPage } from '../features/admin/SongEditorPage';
import { LoginPage } from '../features/auth/LoginPage';
import { SongDetailPage } from '../features/songs/SongDetailPage';
import { SongsPage } from '../features/songs/SongsPage';

export function App() {
  return (
    <AuthProvider>
      <LineupProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<SongsPage />} />
              <Route path="songs/:slug" element={<SongDetailPage />} />
              <Route path="lineups" element={<LineupsPage />} />
              <Route path="lineups/:id" element={<LineupPage />} />
              <Route
                path="lineups/new"
                element={
                  <RequireRole allowedRoles={['admin', 'editor']}>
                    <LineupPage mode="create" />
                  </RequireRole>
                }
              />
              <Route path="login" element={<LoginPage />} />
              <Route
                path="admin"
                element={
                  <RequireRole allowedRoles={['admin', 'editor']}>
                    <AdminDashboardPage />
                  </RequireRole>
                }
              />
              <Route
                path="admin/songs/new"
                element={
                  <RequireRole allowedRoles={['admin', 'editor']}>
                    <SongEditorPage />
                  </RequireRole>
                }
              />
              <Route
                path="admin/songs/:slug/edit"
                element={
                  <RequireRole allowedRoles={['admin', 'editor']}>
                    <SongEditorPage />
                  </RequireRole>
                }
              />
              <Route
                path="admin/categories"
                element={
                  <RequireRole allowedRoles={['admin']}>
                    <CategoryManagerPage />
                  </RequireRole>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LineupProvider>
    </AuthProvider>
  );
}
