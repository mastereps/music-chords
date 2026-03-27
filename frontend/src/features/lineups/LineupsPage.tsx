import { Link } from 'react-router-dom';

import { formatDate } from '../../utils/date';
import { useLineups } from './LineupProvider';

export function LineupsPage() {
  const { lineups, isLoading, error, canManageLineups } = useLineups();

  return (
    <div className="space-y-4 pb-8">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-panel dark:border-stone-800 dark:bg-stone-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">Lineups</p>
            <h1 className="mt-2 text-2xl font-semibold text-stone-900 dark:text-white">Browse saved song orders.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">
              Open a lineup to see the full song order and jump into each chord sheet with lineup-aware navigation.
            </p>
          </div>

          {canManageLineups ? (
            <Link to="/lineups/new" className="min-h-12 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800">
              New lineup
            </Link>
          ) : null}
        </div>
      </section>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {isLoading && lineups.length === 0 ? <p className="text-sm text-stone-500 dark:text-stone-400">Loading lineups...</p> : null}

      {!isLoading && lineups.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-500 shadow-panel dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
          {canManageLineups ? 'No lineups yet. Create the first saved set list.' : 'No lineups have been published yet.'}
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {lineups.map((lineup) => (
          <Link
            key={lineup.id}
            to={`/lineups/${lineup.id}`}
            className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-panel transition hover:border-brand-400 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-300">Saved lineup</p>
            <h2 className="mt-3 text-xl font-semibold text-stone-900 dark:text-white">{lineup.title}</h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-stone-600 dark:text-stone-300">
              {lineup.description?.trim() || 'No description added for this lineup.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span className="rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800">{lineup.songCount} songs</span>
              <span className="rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800">Updated {formatDate(lineup.updatedAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
