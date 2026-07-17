import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { SidebarArt } from './components/SidebarArt';

/** Only Dashboard and Students lead anywhere; the rest are design placeholders. */
const NAV_ITEMS = [
  { label: 'Dashboard', icon: '🏠', to: '/tracker' },
  { label: 'Students', icon: '👤', to: '/tracker/students' },
  { label: 'Checklists', icon: '📋', to: null },
  { label: 'Reports', icon: '📊', to: null },
  { label: 'Resources', icon: '📚', to: null },
  { label: 'Settings', icon: '⚙️', to: null }
];

const ITEM_BASE = 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition';

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <span aria-hidden="true" className="font-display text-3xl leading-none text-studio-gold">
        𝄞
      </span>
      <div>
        <p className="font-display text-lg font-semibold leading-tight text-studio-ink">Music Studio</p>
        <p className="font-display text-xs italic leading-tight text-studio-muted">Progress Tracker</p>
      </div>
    </div>
  );
}

export function TrackerLayout() {
  // The chords app defaults <html> to `dark`, but this design is light-only. Suspend the
  // dark class while the tracker is mounted so shared components (e.g. DeleteModal) render
  // light too, then hand the theme back on the way out.
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.remove('dark');

    return () => {
      if (wasDark) {
        root.classList.add('dark');
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-studio-page font-sans text-studio-ink">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-studio-line bg-studio-sidebar lg:flex">
        <div className="px-5 py-6">
          <Wordmark />
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) =>
            item.to ? (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/tracker'}
                className={({ isActive }) =>
                  `${ITEM_BASE} ${isActive ? 'bg-[#F2E3C4] font-semibold text-studio-ink' : 'text-studio-ink/80 hover:bg-studio-line/70'}`
                }
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ) : (
              <span key={item.label} className={`${ITEM_BASE} cursor-default text-studio-ink/70`}>
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </span>
            )
          )}
        </nav>
        <div className="mt-auto">
          <SidebarArt />
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-20 border-b border-studio-line bg-studio-sidebar/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Wordmark />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
          {NAV_ITEMS.map((item) =>
            item.to ? (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/tracker'}
                className={({ isActive }) =>
                  `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    isActive ? 'bg-[#F2E3C4] text-studio-ink' : 'text-studio-ink/70 hover:bg-studio-line/70'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <span key={item.label} className="shrink-0 cursor-default rounded-full px-3 py-1.5 text-xs font-semibold text-studio-ink/50">
                {item.label}
              </span>
            )
          )}
        </nav>
      </header>

      <main className="min-w-0 flex-1 px-4 pb-10 pt-28 sm:px-6 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
