import { useEffect, useMemo, useState } from 'react';

import type { Category, SongSummary } from '@music-chords/shared';

import { apiClient } from '../../api/client';
import { CategoryPills } from '../../components/CategoryPills';
import { SearchBar } from '../../components/SearchBar';
import { SongCard } from '../../components/SongCard';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

export function SongsPage() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<SongSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(undefined);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query, 250);

  useEffect(() => {
    const controller = new AbortController();
    void apiClient.getCategories(controller.signal).then(setCategories).catch(() => setCategories([]));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadSongs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiClient.getSongs({ q: debouncedQuery, categoryId: activeCategoryId, page: 1, pageSize: 20 }, controller.signal);
        setSongs(result.items);
        setTotal(result.total);
      } catch (loadError) {
        if ((loadError as Error).name === 'AbortError') {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load songs.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadSongs();
    return () => controller.abort();
  }, [debouncedQuery, activeCategoryId]);

  const activeCategoryName = useMemo(
    () => categories.find((category) => category.id === activeCategoryId)?.name,
    [categories, activeCategoryId]
  );

  return (
    <div className="space-y-4">
      <section className="hidden gap-4 sm:grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-panel dark:border-stone-800 dark:bg-stone-900">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">Chords only</p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Readable chord sheets built for phone screens.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">
            Search by title, artist, category, tag, or chord content. Open a song fast, transpose it, and keep the layout readable during practice.
          </p>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-brand-900 p-5 text-brand-50 shadow-panel">
          <p className="text-sm uppercase tracking-[0.25em] text-brand-200">Current results</p>
          <p className="mt-3 text-4xl font-semibold">{total}</p>
          <p className="mt-2 text-sm text-brand-100">{activeCategoryName ? `Filtered by ${activeCategoryName}` : 'Across all folders'}</p>
        </div>
      </section>

      <SearchBar value={query} onChange={setQuery} onClear={() => setQuery('')} />

      <CategoryPills items={categories} activeCategoryId={activeCategoryId} onSelect={setActiveCategoryId} />

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm text-stone-500 dark:text-stone-400">
        <span>{isLoading ? 'Refreshing results...' : `${songs.length} visible on this page`}</span>
        {debouncedQuery ? <span>Search: “{debouncedQuery}”</span> : <span>Use short, specific titles for faster matching.</span>}
      </div>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-3">
        {!isLoading && songs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
            No songs matched your search.
          </div>
        ) : null}
        {songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
}

