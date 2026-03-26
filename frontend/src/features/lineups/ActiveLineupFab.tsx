import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useLineups } from './LineupProvider';

export function ActiveLineupFab({ currentSongSlug }: { currentSongSlug: string }) {
  const { activeLineup } = useLineups();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [currentSongSlug]);

  const lineupSongs = activeLineup?.songs ?? [];

  return (
    <>
      {isOpen ? <button type="button" aria-label="Close lineup popup" onClick={() => setIsOpen(false)} className="fixed inset-0 z-40 bg-stone-950/45 backdrop-blur-[1px]" /> : null}

      <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end sm:bottom-6 sm:right-6">
        {isOpen ? (
          <div className="mb-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-[1.8rem] border border-stone-200 bg-white/95 shadow-[0_20px_60px_rgba(18,27,12,0.28)] backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
            <div className="border-b border-stone-200 px-4 py-4 dark:border-stone-800">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">Active lineup</p>
              <h2 className="mt-2 text-lg font-semibold text-stone-900 dark:text-white">{activeLineup?.name ?? 'No lineup selected'}</h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {lineupSongs.length > 0 ? `${lineupSongs.length} songs ready for quick jumps` : 'Choose and save a lineup before using quick mobile navigation.'}
              </p>
            </div>

            {lineupSongs.length > 0 ? (
              <div className="max-h-[min(60vh,26rem)] space-y-2 overflow-y-auto px-3 py-3">
                {lineupSongs.map((song, index) => {
                  const isCurrentSong = song.slug === currentSongSlug;

                  return (
                    <Link
                      key={song.id}
                      to={`/songs/${song.slug}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 rounded-[1.4rem] px-3 py-3 transition ${
                        isCurrentSong
                          ? 'bg-brand-700 text-white'
                          : 'bg-stone-50 text-stone-900 hover:bg-brand-50 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-brand-900/30'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                          isCurrentSong ? 'bg-white/18 text-white' : 'bg-white text-brand-700 dark:bg-stone-900 dark:text-brand-200'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{song.title}</span>
                        <span className={`mt-1 block truncate text-xs ${isCurrentSong ? 'text-brand-50' : 'text-stone-500 dark:text-stone-400'}`}>
                          {song.artist || 'Unknown artist'}
                        </span>
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isCurrentSong ? 'bg-white/18 text-white' : 'bg-white text-brand-700 dark:bg-stone-900 dark:text-brand-200'}`}>
                        {song.key}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-5 text-sm text-stone-600 dark:text-stone-300">
                <Link to="/lineups" onClick={() => setIsOpen(false)} className="inline-flex rounded-2xl bg-brand-700 px-4 py-3 font-semibold text-white">
                  Open lineup manager
                </Link>
              </div>
            )}
          </div>
        ) : null}

        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close lineup popup' : 'Open lineup popup'}
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-[0_14px_34px_rgba(66,93,49,0.45)] transition hover:bg-brand-600"
        >
          <span className={`absolute h-0.5 w-6 rounded-full bg-current transition duration-200 ${isOpen ? 'rotate-45' : 'rotate-0'}`} />
          <span className={`absolute h-0.5 w-6 rounded-full bg-current transition duration-200 ${isOpen ? '-rotate-45' : 'rotate-90'}`} />
        </button>
      </div>
    </>
  );
}
