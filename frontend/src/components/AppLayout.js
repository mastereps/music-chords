import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../app/AuthProvider';
export function AppLayout() {
    const { user, logout } = useAuth();
    const [theme, setTheme] = useState(() => {
        const stored = window.localStorage.getItem('theme');
        return stored === 'dark' ? 'dark' : 'light';
    });
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        window.localStorage.setItem('theme', theme);
    }, [theme]);
    return (_jsxs("div", { className: "min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top,_rgba(111,144,84,0.16),_transparent_40%),linear-gradient(180deg,_#f7f8f4_0%,_#f5f3ef_100%)] text-stone-900 dark:bg-[linear-gradient(180deg,_#172014_0%,_#101711_100%)] dark:text-stone-100", children: [_jsx("header", { className: "sticky top-0 z-30 border-b border-stone-200/80 bg-stone-50/95 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90", children: _jsxs("div", { className: "mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs(Link, { to: "/", className: "flex min-w-0 items-center justify-center gap-3 sm:justify-start", children: [_jsx("span", { className: "h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-brand-700/20 dark:ring-brand-300/20", children: _jsx("img", { src: "/images/maranatha_music_logo.png", alt: "Maranatha Music logo", className: "h-full w-full object-cover" }) }), _jsx("p", { className: "truncate text-[11px] uppercase tracking-[0.22em] text-brand-600 dark:text-brand-300 sm:text-xs sm:tracking-[0.3em]", children: "M-chords" })] }), _jsxs("div", { className: "flex flex-wrap items-center justify-center gap-2 sm:justify-end", children: [_jsx(NavLink, { to: "/lineups", className: ({ isActive }) => `rounded-full border px-3 py-2 text-center text-xs font-semibold transition ${isActive
                                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/40 dark:text-brand-100'
                                        : 'border-stone-300 text-stone-700 hover:border-brand-500 hover:text-brand-700 dark:border-stone-700 dark:text-stone-200'}`, children: "Lineups" }), user?.role && (user.role === 'admin' || user.role === 'editor') ? (_jsx(NavLink, { to: "/admin", className: "rounded-full border border-stone-300 px-3 py-2 text-center text-xs font-semibold text-stone-700 transition hover:border-brand-500 hover:text-brand-700 dark:border-stone-700 dark:text-stone-200", children: "Admin" })) : null, _jsx(ThemeToggle, { theme: theme, onToggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') }), user ? (_jsx("button", { type: "button", onClick: () => void logout(), className: "rounded-full bg-brand-700 px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-brand-800", children: "Sign out" })) : (_jsx(NavLink, { to: "/login", className: "rounded-full bg-brand-700 px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-brand-800", children: "Login" }))] })] }) }), _jsx("main", { className: "mx-auto w-full max-w-6xl min-w-0 px-4 py-4 sm:py-6", children: _jsx(Outlet, {}) })] }));
}


