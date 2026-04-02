import { Link } from 'react-router-dom';

import type { SongDetail, SongSummary } from '@music-chords/shared';

import { useAuth } from '../app/AuthProvider';
import { formatDate } from '../utils/date';
import { SongPinButton } from './SongPinButton';

export function SongCard({ song, onPinnedChange }: { song: SongSummary; onPinnedChange?: (updatedSong: SongDetail) => void }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <article className="relative rounded-[1.75rem] border border-stone-200 bg-white shadow-panel dark:border-stone-800 dark:bg-stone-900">
      <Link
        to={`/songs/${song.slug}`}
        className={`block rounded-[1.75rem] p-4 transition hover:-translate-y-0.5 ${isAdmin ? 'pr-24' : ''}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white">{song.title}</h3>
              {song.isPinned ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
                  Pinned
                </span>
              ) : null}
            </div>
            <p className="mt-1 truncate text-sm text-stone-600 dark:text-stone-300">{song.artist || 'Unknown artist'}</p>
          </div>
          <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            {song.key}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
          {song.category ? <span className="max-w-[9rem] truncate rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800 sm:max-w-none">{song.category.name}</span> : null}
          {song.language ? <span className="max-w-[9rem] truncate rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800 sm:max-w-none">{song.language}</span> : null}
          {song.tags.slice(0, 3).map((tag) => (
            <span key={tag.id} className="max-w-[9rem] truncate rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800 sm:max-w-none">
              #{tag.name}
            </span>
          ))}
          <span className="basis-full text-stone-500 sm:ml-auto sm:basis-auto dark:text-stone-400">Updated {formatDate(song.updatedAt)}</span>
        </div>
      </Link>

      {isAdmin ? (
        <div className="absolute right-4 top-4 z-10">
          <SongPinButton
            songId={song.id}
            isPinned={song.isPinned}
            className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:text-stone-200 dark:hover:border-brand-400 dark:hover:text-brand-200"
            onSuccess={onPinnedChange}
          />
        </div>
      ) : null}
    </article>
  );
}
