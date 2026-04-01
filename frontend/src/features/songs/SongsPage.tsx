import { useEffect, useMemo, useState } from 'react';

import type { Category } from '@music-chords/shared';

import { apiClient } from '../../api/client';
import { ArtistFilterSelect } from '../../components/ArtistFilterSelect';
import { CategoryPills } from '../../components/CategoryPills';
import { SearchBar } from '../../components/SearchBar';
import { SongCard } from '../../components/SongCard';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePaginatedSongs } from '../../hooks/usePaginatedSongs';

const PAGE_SIZE = 20;
const ARTIST_OPTIONS = [
  'Ron Kenoly',
  'Paul Wilbur',
  'Terry MacAlmon',
  'Benny Hinn',
  'Don Moen',
  'Maranatha Music',
  'Hosanna Music',
  'Bethel Music'
] as const;

type ArtistFilterValue = '' | (typeof ARTIST_OPTIONS)[number];

export function SongsPage() {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(undefined);
  const [selectedArtist, setSelectedArtist] = useState<ArtistFilterValue>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 250);
  const prioritizePinned = !debouncedQuery && !activeCategoryId && !selectedArtist;
  const { songs, total, hasMore, isLoadingInitial, isLoadingMore, error, loadMoreRef } = usePaginatedSongs({
    q: debouncedQuery,
    categoryId: activeCategoryId,
    artist: selectedArtist || undefined,
    prioritizePinned,
    pageSize: PAGE_SIZE,
    refreshKey
  });

  useEffect(() => {
    const controller = new AbortController();
    void apiClient.getCategories(controller.signal).then(setCategories).catch(() => setCategories([]));
    return () => controller.abort();
  }, []);

  const activeCategoryName = useMemo(
    () => categories.find((category) => category.id === activeCategoryId)?.name,
    [categories, activeCategoryId]
  );

  const activeResultsLabel = useMemo(() => {
    const activeFilters = [activeCategoryName, selectedArtist].filter(Boolean);
    return activeFilters.length > 0 ? `Filtered by ${activeFilters.join(' / ')}` : 'Across all folders';
  }, [activeCategoryName, selectedArtist]);

  const activeFilterDescription = useMemo(() => {
    const filterParts: string[] = [];

    if (debouncedQuery) {
      filterParts.push(`Search: "${debouncedQuery}"`);
    }

    if (activeCategoryName) {
      filterParts.push(`Folder: ${activeCategoryName}`);
    }

    if (selectedArtist) {
      filterParts.push(`Artist: ${selectedArtist}`);
    }

    if (prioritizePinned) {
      filterParts.push('Pinned songs first');
    }

    return filterParts.length > 0 ? filterParts.join(' | ') : 'Use short, specific titles for faster matching.';
  }, [activeCategoryName, debouncedQuery, prioritizePinned, selectedArtist]);

  return (
    <div className="space-y-4">
      <section className="hidden gap-4 sm:grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-panel dark:border-stone-800 dark:bg-stone-900">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">Chords only</p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Readable chord sheets built for phone screens.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">
            Search by title, artist, category, or tag. Open a song fast, transpose it, and keep the layout readable during practice.
          </p>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-brand-900 p-5 text-brand-50 shadow-panel">
          <p className="text-sm uppercase tracking-[0.25em] text-brand-200">Current results</p>
          <p className="mt-3 text-4xl font-semibold">{total}</p>
          <p className="mt-2 text-sm text-brand-100">{activeResultsLabel}</p>
        </div>
      </section>

      <SearchBar value={query} onChange={setQuery} onClear={() => setQuery('')} />

      <ArtistFilterSelect artists={ARTIST_OPTIONS} value={selectedArtist} onChange={(artist) => setSelectedArtist(artist as ArtistFilterValue)} />

      <CategoryPills items={categories} activeCategoryId={activeCategoryId} onSelect={setActiveCategoryId} />

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm text-stone-500 dark:text-stone-400">
        <span>
          {isLoadingInitial
            ? 'Loading songs...'
            : total > songs.length
              ? `${songs.length} of ${total} songs loaded`
              : `${songs.length} songs loaded`}
        </span>
        <span>{activeFilterDescription}</span>
      </div>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="grid w-full gap-3 pb-6">
        {!isLoadingInitial && songs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
            No songs matched your current filters.
          </div>
        ) : null}
        {songs.map((song) => (
          <SongCard key={song.id} song={song} onPinnedChange={() => setRefreshKey((currentValue) => currentValue + 1)} />
        ))}
        <div
          ref={loadMoreRef}
          aria-hidden="true"
          className={songs.length > 0 ? 'flex min-h-14 items-center justify-center px-2 py-2 text-sm text-stone-500 dark:text-stone-400' : 'h-px'}
        >
          {songs.length > 0 ? (isLoadingMore ? 'Loading more songs...' : hasMore ? 'Scroll to load more songs' : 'End of song list') : null}
        </div>
      </div>
    </div>
  );
}
