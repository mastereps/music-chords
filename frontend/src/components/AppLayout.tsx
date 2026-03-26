import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../app/AuthProvider';

export function AppLayout() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = window.localStorage.getItem('theme');
    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top,_rgba(111,144,84,0.16),_transparent_40%),linear-gradient(180deg,_#f7f8f4_0%,_#f5f3ef_100%)] text-stone-900 dark:bg-[linear-gradient(180deg,_#172014_0%,_#101711_100%)] dark:text-stone-100">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-stone-50/95 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex min-w-0 items-center justify-center gap-3 sm:justify-start">
            <img src="/images/music-charts-logo.png" alt="Music Charts logo" className="h-10 w-10 shrink-0 object-contain" />
            <p className="truncate text-[11px] uppercase tracking-[0.22em] text-brand-600 dark:text-brand-300 sm:text-xs sm:tracking-[0.3em]">
              Music Chords
            </p>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <NavLink
              to="/lineups"
              className={({ isActive }) =>
                `rounded-full border px-3 py-2 text-center text-xs font-semibold transition ${
                  isActive
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/40 dark:text-brand-100'
                    : 'border-stone-300 text-stone-700 hover:border-brand-500 hover:text-brand-700 dark:border-stone-700 dark:text-stone-200'
                }`
              }
            >
              Lineups
            </NavLink>
            {user?.role && (user.role === 'admin' || user.role === 'editor') ? (
              <NavLink
                to="/admin"
                className="rounded-full border border-stone-300 px-3 py-2 text-center text-xs font-semibold text-stone-700 transition hover:border-brand-500 hover:text-brand-700 dark:border-stone-700 dark:text-stone-200"
              >
                Admin
              </NavLink>
            ) : null}
            <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
            {user ? (
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-full bg-brand-700 px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-brand-800"
              >
                Sign out
              </button>
            ) : (
              <NavLink
                to="/login"
                className="rounded-full bg-brand-700 px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-brand-800"
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl min-w-0 px-4 py-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  );
}
