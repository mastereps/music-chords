import { Link } from 'react-router-dom';

import type { SongSummary } from '@music-chords/shared';

import { formatDate } from '../utils/date';

export function SongCard({ song }: { song: SongSummary }) {
  return (
    <Link
      to={`/songs/${song.slug}`}
      className="block rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-panel transition hover:-translate-y-0.5 dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-stone-900 dark:text-white">{song.title}</h3>
          <p className="mt-1 truncate text-sm text-stone-600 dark:text-stone-300">{song.artist || 'Unknown artist'}</p>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
          {song.key}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
        {song.category ? <span className="rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800">{song.category.name}</span> : null}
        {song.language ? <span className="rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800">{song.language}</span> : null}
        {song.tags.slice(0, 3).map((tag) => (
          <span key={tag.id} className="rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800">
            #{tag.name}
          </span>
        ))}
        <span className="ml-auto">Updated {formatDate(song.updatedAt)}</span>
      </div>
    </Link>
  );
}
