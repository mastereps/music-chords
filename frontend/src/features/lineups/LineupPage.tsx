import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import type { LineupSong, SongSummary } from '@music-chords/shared';

import { DeleteModal } from '../../components/DeleteModal';
import { SearchBar } from '../../components/SearchBar';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePaginatedSongs } from '../../hooks/usePaginatedSongs';
import { formatDate } from '../../utils/date';
import { useLineups } from './LineupProvider';
import { toLineupSong } from './lineupTypes';

function haveSongsChanged(left: LineupSong[], right: LineupSong[]) {
  if (left.length !== right.length) {
    return true;
  }

  return left.some((song, index) => {
    const rightSong = right[index];
    return (
      song.id !== rightSong?.id ||
      song.slug !== rightSong?.slug ||
      song.title !== rightSong?.title ||
      song.artist !== rightSong?.artist ||
      song.key !== rightSong?.key
    );
  });
}

export function LineupPage({ mode = 'detail' }: { mode?: 'detail' | 'create' }) {
  const isCreateMode = mode === 'create';
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeLineupId, canManageLineups, openLineup, clearActiveLineup, createLineup, updateLineup, deleteLineup } = useLineups();
  const lineupId = !isCreateMode && id ? Number(id) : null;
  const [loadedLineupId, setLoadedLineupId] = useState<number | null>(null);
  const [loadedTitle, setLoadedTitle] = useState('');
  const [loadedDescription, setLoadedDescription] = useState<string | null>(null);
  const [loadedSongs, setLoadedSongs] = useState<LineupSong[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftSongs, setDraftSongs] = useState<LineupSong[]>([]);
  const [query, setQuery] = useState('');
  const [searchRefreshKey, setSearchRefreshKey] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!isCreateMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 250);
  const {
    songs: songResults,
    total: songResultsTotal,
    hasMore,
    isLoadingInitial: isLoadingSongs,
    isLoadingMore,
    error: searchError,
    loadMoreRef
  } = usePaginatedSongs({
    q: debouncedQuery,
    status: 'published',
    refreshKey: searchRefreshKey
  });

  useEffect(() => {
    if (isCreateMode) {
      clearActiveLineup();
      setLoadedLineupId(null);
      setLoadedTitle('');
      setLoadedDescription(null);
      setLoadedSongs([]);
      setUpdatedAt(null);
      setDraftTitle('');
      setDraftDescription('');
      setDraftSongs([]);
      setLoadError(null);
      setEditorError(null);
      setSaveNotice(null);
      setIsLoading(false);
      return;
    }

    if (!lineupId || Number.isNaN(lineupId)) {
      setLoadError('Lineup not found.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    setEditorError(null);
    setSaveNotice(null);

    void openLineup(lineupId)
      .then((lineup) => {
        setLoadedLineupId(lineup.id);
        setLoadedTitle(lineup.title);
        setLoadedDescription(lineup.description);
        setLoadedSongs(lineup.songs);
        setUpdatedAt(lineup.updatedAt);
        setDraftTitle(lineup.title);
        setDraftDescription(lineup.description ?? '');
        setDraftSongs(lineup.songs);
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : 'Unable to load lineup.');
      })
      .finally(() => setIsLoading(false));
  }, [id, isCreateMode, lineupId]);

  const draftSongIds = useMemo(() => new Set(draftSongs.map((song) => song.id)), [draftSongs]);
  const hasUnsavedChanges =
    isCreateMode || loadedLineupId === null
      ? draftTitle.trim().length > 0 || draftDescription.trim().length > 0 || draftSongs.length > 0
      : loadedTitle !== draftTitle.trim() || (loadedDescription ?? '') !== draftDescription.trim() || haveSongsChanged(loadedSongs, draftSongs);

  if (isCreateMode && !canManageLineups) {
    return <Navigate to="/lineups" replace />;
  }

  const handleAddSong = (song: SongSummary) => {
    if (draftSongIds.has(song.id)) {
      return;
    }

    setDraftSongs((currentSongs) => [...currentSongs, toLineupSong(song)]);
    setEditorError(null);
    setSaveNotice(null);
  };

  const handleRemoveSong = (songId: number) => {
    setDraftSongs((currentSongs) => currentSongs.filter((song) => song.id !== songId));
    setEditorError(null);
    setSaveNotice(null);
  };

  const moveSong = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= draftSongs.length) {
      return;
    }

    setDraftSongs((currentSongs) => {
      const nextSongs = [...currentSongs];
      const [movedSong] = nextSongs.splice(index, 1);
      nextSongs.splice(nextIndex, 0, movedSong);
      return nextSongs;
    });

    setSaveNotice(null);
  };

  const handleResetSearch = () => {
    setQuery('');
    setSearchRefreshKey((currentValue) => currentValue + 1);
  };

  const handleSave = async () => {
    if (!draftTitle.trim()) {
      setEditorError('Lineup title is required.');
      return;
    }

    if (draftSongs.length === 0) {
      setEditorError('Add at least one song before saving this lineup.');
      return;
    }

    setIsSaving(true);

    try {
      const input = {
        title: draftTitle.trim(),
        description: draftDescription.trim() || null,
        songIds: draftSongs.map((song) => song.id)
      };
      const savedLineup = isCreateMode || !loadedLineupId ? await createLineup(input) : await updateLineup(loadedLineupId, input);

      setLoadedLineupId(savedLineup.id);
      setLoadedTitle(savedLineup.title);
      setLoadedDescription(savedLineup.description);
      setLoadedSongs(savedLineup.songs);
      setUpdatedAt(savedLineup.updatedAt);
      setDraftTitle(savedLineup.title);
      setDraftDescription(savedLineup.description ?? '');
      setDraftSongs(savedLineup.songs);
      setEditorError(null);
      setSaveNotice(`Saved ${savedLineup.title}.`);

      if (isCreateMode) {
        navigate(`/lineups/${savedLineup.id}`, { replace: true });
      }
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : 'Unable to save lineup.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!loadedLineupId) {
      return;
    }

    await deleteLineup(loadedLineupId);
    setIsDeleteOpen(false);
    navigate('/lineups', { replace: true });
  };

  const pageTitle = isCreateMode ? 'Create a saved lineup.' : draftTitle || 'Lineup detail';
  const pageDescription = isCreateMode
    ? 'Build a reusable song order for quick navigation during practice or service.'
    : draftDescription.trim() || 'Open songs in order and keep lineup-aware navigation active.';

  if (loadError) {
    return <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-stone-500 dark:text-stone-400">Loading lineup...</p>;
  }

  return (
    <>
      <div className="space-y-4 pb-24">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-5  dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">
                {isCreateMode ? 'Lineup editor' : 'Lineup detail'}
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-stone-900 dark:text-white">{pageTitle}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">{pageDescription}</p>
            </div>

            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              <Link to="/lineups" className="min-h-12 rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 dark:border-stone-700 dark:text-stone-200">
                Back to lineups
              </Link>
              {!isCreateMode && loadedLineupId && activeLineupId === loadedLineupId ? (
                <span className="inline-flex min-h-12 items-center rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                  Active lineup
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <div className={`grid gap-4 ${canManageLineups ? 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]' : ''}`}>
          <section className="space-y-4">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-5  dark:border-stone-800 dark:bg-stone-900">
              {canManageLineups ? (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-stone-400">Title</span>
                      <input
                        value={draftTitle}
                        onChange={(event) => {
                          setDraftTitle(event.target.value);
                          setSaveNotice(null);
                        }}
                        placeholder="Sunday lineup"
                        className="mt-2 min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base outline-none transition focus:border-brand-500 dark:border-stone-700 dark:bg-stone-950"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-stone-400">Description</span>
                      <textarea
                        value={draftDescription}
                        onChange={(event) => {
                          setDraftDescription(event.target.value);
                          setSaveNotice(null);
                        }}
                        rows={3}
                        placeholder="Optional note for this lineup"
                        className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base outline-none transition focus:border-brand-500 dark:border-stone-700 dark:bg-stone-950"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span className="rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800">{draftSongs.length} songs in order</span>
                    {updatedAt ? <span className="rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800">Updated {formatDate(updatedAt)}</span> : null}
                    {hasUnsavedChanges ? <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">Unsaved changes</span> : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSave()}
                      disabled={isSaving}
                      className="min-h-12 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? 'Saving...' : isCreateMode ? 'Create lineup' : 'Save lineup'}
                    </button>
                    {!isCreateMode && loadedLineupId ? (
                      <button
                        type="button"
                        onClick={() => setIsDeleteOpen(true)}
                        className="min-h-12 rounded-2xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-700 dark:border-red-700 dark:text-red-300"
                      >
                        Delete lineup
                      </button>
                    ) : null}
                  </div>

                  {editorError ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{editorError}</p> : null}
                  {saveNotice ? <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:bg-brand-900/40 dark:text-brand-100">{saveNotice}</p> : null}
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span className="rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800">{draftSongs.length} songs</span>
                    {updatedAt ? <span className="rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800">Updated {formatDate(updatedAt)}</span> : null}
                  </div>
                  {draftDescription.trim() ? <p className="mt-4 text-sm leading-6 text-stone-600 dark:text-stone-300">{draftDescription.trim()}</p> : null}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-stone-200 bg-white p-4  dark:border-stone-800 dark:bg-stone-900">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">Songs in order</p>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    {canManageLineups ? 'Drag-free ordering with explicit move controls.' : 'Open any song to continue with this lineup active.'}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {draftSongs.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                    {canManageLineups ? 'Search the library, then add songs here to build this lineup.' : 'This lineup does not have any songs yet.'}
                  </div>
                ) : null}

                {draftSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60"
                  >
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link to={`/songs/${song.slug}`} className="block max-w-[220px] truncate text-base font-semibold text-stone-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-200">
                          {song.title}
                        </Link>
                        <p className="mt-1 truncate text-sm text-stone-600 dark:text-stone-300">{song.artist || 'Unknown artist'}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-stone-900 dark:text-brand-200">
                        {song.key}
                      </span>
                    </div>

                    {canManageLineups ? (
                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <button
                          type="button"
                          onClick={() => moveSong(index, -1)}
                          disabled={index === 0}
                          className="min-h-11 rounded-2xl border border-stone-300 px-3 text-sm font-semibold text-stone-700 transition disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-700 dark:text-stone-200"
                        >
                          Move up
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSong(index, 1)}
                          disabled={index === draftSongs.length - 1}
                          className="min-h-11 rounded-2xl border border-stone-300 px-3 text-sm font-semibold text-stone-700 transition disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-700 dark:text-stone-200"
                        >
                          Move down
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSong(song.id)}
                          className="min-h-11 rounded-2xl border border-red-200 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {canManageLineups ? (
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <SearchBar
                value={query}
                onChange={setQuery}
                onClear={handleResetSearch}
                sticky={false}
                label="Search published songs"
                placeholder="Find songs to add to this lineup"
              />

              <div className="rounded-[2rem] border border-stone-200 bg-white p-4  dark:border-stone-800 dark:bg-stone-900">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-white">Library results</p>
                    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                      {isLoadingSongs
                        ? 'Refreshing songs...'
                        : songResultsTotal > songResults.length
                          ? `${songResults.length} of ${songResultsTotal} published songs ready to add`
                          : `${songResults.length} published songs ready to add`}
                    </p>
                  </div>
                  {debouncedQuery ? <span className="basis-full text-xs text-stone-500 dark:text-stone-400 sm:basis-auto">Search: "{debouncedQuery}"</span> : null}
                </div>

                {searchError ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{searchError}</p> : null}

                <div className="mt-4 space-y-3">
                  {!isLoadingSongs && songResults.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                      {debouncedQuery ? 'No songs matched that search.' : 'No published songs are available in the library.'}
                    </div>
                  ) : null}

                  {songResults.map((song) => {
                    const isAdded = draftSongIds.has(song.id);

                    return (
                      <div
                        key={song.id}
                        className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <Link to={`/songs/${song.slug}`} className="block max-w-[190px] truncate text-base font-semibold text-stone-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-200">
                              {song.title}
                            </Link>
                            <p className="mt-1 truncate text-sm text-stone-600 dark:text-stone-300">{song.artist || 'Unknown artist'}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-stone-900 dark:text-brand-200">
                            {song.key}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                          <div className="flex min-w-0 flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
                            {song.category ? <span className="max-w-[8rem] truncate rounded-full bg-white px-3 py-1 dark:bg-stone-900 sm:max-w-none">{song.category.name}</span> : null}
                            {song.language ? <span className="max-w-[8rem] truncate rounded-full bg-white px-3 py-1 dark:bg-stone-900 sm:max-w-none">{song.language}</span> : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddSong(song)}
                            disabled={isAdded}
                            className="min-h-11 w-full rounded-2xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600 dark:disabled:bg-stone-700 dark:disabled:text-stone-300 sm:w-auto"
                          >
                            {isAdded ? 'Added' : 'Add song'}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div
                    ref={loadMoreRef}
                    aria-hidden="true"
                    className={songResults.length > 0 ? 'flex min-h-14 items-center justify-center px-2 py-2 text-sm text-stone-500 dark:text-stone-400' : 'h-px'}
                  >
                    {songResults.length > 0
                      ? isLoadingMore
                        ? 'Loading more songs...'
                        : hasMore
                          ? 'Scroll to load more songs'
                          : 'End of song library'
                      : null}
                  </div>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteOpen}
        title="Delete lineup"
        message={`Delete ${draftTitle || 'this lineup'}? This cannot be undone.`}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
