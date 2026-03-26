import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import type { Category, SongSummary } from '@music-chords/shared';

import { apiClient, type DashboardStats } from '../../api/client';
import { DeleteModal } from '../../components/DeleteModal';
import { SearchBar } from '../../components/SearchBar';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [songs, setSongs] = useState<SongSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | ''>('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [selectedSong, setSelectedSong] = useState<SongSummary | null>(null);
  const [publishingSongId, setPublishingSongId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedQuery = useDebouncedValue(query, 250);

  const loadSongs = (signal?: AbortSignal) =>
    apiClient.getSongs({ q: debouncedQuery, status: status || undefined, categoryId, page: 1, pageSize: 25 }, signal);

  const refreshDashboard = async () => {
    const [refreshedStats, refreshedSongs] = await Promise.all([apiClient.getDashboardStats(), loadSongs()]);
    setStats(refreshedStats);
    setSongs(refreshedSongs.items);
  };

  const handlePublish = async (song: SongSummary) => {
    setPublishingSongId(song.id);
    setError(null);

    try {
      await apiClient.updateSongStatus(song.slug, 'published', 'Published from dashboard');
      await refreshDashboard();
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Unable to publish song.');
    } finally {
      setPublishingSongId(null);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    void Promise.all([apiClient.getDashboardStats(controller.signal), apiClient.getCategories(controller.signal)])
      .then(([loadedStats, loadedCategories]) => {
        setStats(loadedStats);
        setCategories(loadedCategories);
      })
      .catch((loadError) => {
        if ((loadError as Error).name !== 'AbortError') {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard metadata.');
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadDashboardSongs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await loadSongs(controller.signal);
        setSongs(result.items);
      } catch (loadError) {
        if ((loadError as Error).name === 'AbortError') {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load songs.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardSongs();
    return () => controller.abort();
  }, [debouncedQuery, status, categoryId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">Admin area</p>
          <h2 className="text-2xl font-semibold">Song management</h2>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Link to="/admin/categories" className="flex-1 rounded-2xl border border-stone-300 px-4 py-3 text-center text-sm font-semibold dark:border-stone-700 sm:flex-none">
            Categories
          </Link>
          <Link to="/admin/songs/new" className="flex-1 rounded-2xl bg-brand-700 px-4 py-3 text-center text-sm font-semibold text-white sm:flex-none">
            New song
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[['Total songs', stats?.totalSongs], ['Published', stats?.publishedSongs], ['Drafts', stats?.draftSongs], ['Categories', stats?.totalCategories], ['Pending suggestions', stats?.pendingSuggestions]].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value ?? '...'}</p>
          </div>
        ))}
      </div>

      <SearchBar value={query} onChange={setQuery} onClear={() => setQuery('')} label="Search song library" placeholder="Title, artist, tag, folder" sticky={false} />

      <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900">
        <label className="text-sm font-semibold">Status</label>
        <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-900 sm:w-auto">
          <option value="">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <label className="ml-2 text-sm font-semibold">Folder</label>
        <select value={categoryId ?? ''} onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : undefined)} className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-900 sm:w-auto">
          <option value="">All folders</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <span className="basis-full text-sm text-stone-500 dark:text-stone-400 sm:ml-auto sm:basis-auto">{isLoading ? 'Refreshing...' : `${songs.length} songs shown`}</span>
      </div>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="space-y-3">
        {songs.map((song) => (
          <div key={song.id} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold">{song.title}</h3>
                <p className="text-sm text-stone-600 dark:text-stone-300">{song.artist || 'Unknown artist'} - {song.status} - {song.category?.name ?? 'No folder'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {song.status === 'draft' ? (
                  <button
                    type="button"
                    onClick={() => void handlePublish(song)}
                    disabled={publishingSongId === song.id}
                    className="rounded-2xl border border-brand-300 px-4 py-3 text-sm font-semibold text-brand-700 disabled:opacity-60 dark:border-brand-700 dark:text-brand-300"
                  >
                    {publishingSongId === song.id ? 'Publishing...' : 'Publish'}
                  </button>
                ) : null}
                <Link to={`/songs/${song.slug}`} className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold dark:border-stone-700">
                  View
                </Link>
                <Link to={`/admin/songs/${song.slug}/edit`} className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white">
                  Edit
                </Link>
                <button type="button" onClick={() => setSelectedSong(song)} className="rounded-2xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-700 dark:text-red-300">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DeleteModal
        isOpen={Boolean(selectedSong)}
        title="Delete song"
        message={`Delete ${selectedSong?.title ?? 'this song'}? This cannot be undone.`}
        onCancel={() => setSelectedSong(null)}
        onConfirm={async () => {
          if (!selectedSong) {
            return;
          }

          await apiClient.deleteSong(selectedSong.id);
          setSelectedSong(null);
          await refreshDashboard();
        }}
      />
    </div>
  );
}
