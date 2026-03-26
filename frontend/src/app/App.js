import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
import { AppLayout } from '../components/AppLayout';
import { RequireRole } from './RequireRole';
import { CategoryManagerPage } from '../features/categories/CategoryManagerPage';
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage';
import { LineupProvider } from '../features/lineups/LineupProvider';
import { LineupPage } from '../features/lineups/LineupPage';
import { SongEditorPage } from '../features/admin/SongEditorPage';
import { LoginPage } from '../features/auth/LoginPage';
import { SongDetailPage } from '../features/songs/SongDetailPage';
import { SongsPage } from '../features/songs/SongsPage';
export function App() {
    return (_jsx(AuthProvider, { children: _jsx(LineupProvider, { children: _jsx(BrowserRouter, { children: _jsx(Routes, { children: _jsxs(Route, { element: _jsx(AppLayout, {}), children: [_jsx(Route, { index: true, element: _jsx(SongsPage, {}) }), _jsx(Route, { path: "songs/:slug", element: _jsx(SongDetailPage, {}) }), _jsx(Route, { path: "lineups", element: _jsx(LineupPage, {}) }), _jsx(Route, { path: "login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "admin", element: _jsx(RequireRole, { allowedRoles: ['admin', 'editor'], children: _jsx(AdminDashboardPage, {}) }) }), _jsx(Route, { path: "admin/songs/new", element: _jsx(RequireRole, { allowedRoles: ['admin', 'editor'], children: _jsx(SongEditorPage, {}) }) }), _jsx(Route, { path: "admin/songs/:slug/edit", element: _jsx(RequireRole, { allowedRoles: ['admin', 'editor'], children: _jsx(SongEditorPage, {}) }) }), _jsx(Route, { path: "admin/categories", element: _jsx(RequireRole, { allowedRoles: ['admin'], children: _jsx(CategoryManagerPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }) }) }) }));
}
