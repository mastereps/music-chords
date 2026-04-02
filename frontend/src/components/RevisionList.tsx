import type { SongRevision } from '@music-chords/shared';

import { formatDate } from '../utils/date';

export function RevisionList({ items }: { items: SongRevision[] }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-4  dark:border-stone-800 dark:bg-stone-900">
      <h3 className="text-base font-semibold">Revision history</h3>
      <div className="mt-4 space-y-4">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-stone-200 p-3 dark:border-stone-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{item.editor.displayName}</p>
                <span className="text-xs text-stone-500 dark:text-stone-400">{formatDate(item.createdAt)}</span>
              </div>
              {item.revisionNote ? <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{item.revisionNote}</p> : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-stone-500 dark:text-stone-400">No revisions yet.</p>
        )}
      </div>
    </div>
  );
}
