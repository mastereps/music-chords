import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { transposeChordToken, transposeContent } from '@music-chords/shared';
import type { SongDetail, SongRevision } from '@music-chords/shared';

import { useAuth } from '../../app/AuthProvider';
import { apiClient } from '../../api/client';
import { ChordSheet } from '../../components/ChordSheet';
import { FontSizeControls } from '../../components/FontSizeControls';
import { RevisionList } from '../../components/RevisionList';
import { SongPinButton } from '../../components/SongPinButton';
import { SuggestionForm } from '../../components/SuggestionForm';
import { TransposeControls } from '../../components/TransposeControls';
import { ActiveLineupFab } from '../lineups/ActiveLineupFab';
import { formatDate } from '../../utils/date';

export function SongDetailPage() {
  const { slug = '' } = useParams();
  const { user } = useAuth();
  const [song, setSong] = useState<SongDetail | null>(null);
  const [revisions, setRevisions] = useState<SongRevision[]>([]);
  const [offset, setOffset] = useState(0);
  const [fontSize, setFontSize] = useState(17);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isEditor = user?.role === 'admin' || user?.role === 'editor';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    void apiClient
      .getSong(slug, controller.signal)
      .then((loadedSong) => {
        setSong(loadedSong);
        setOffset(0);
      })
      .catch((loadError) => {
        if ((loadError as Error).name === 'AbortError') {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load song.');
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (!song?.id || !isEditor) {
      setRevisions([]);
      return;
    }

    const controller = new AbortController();
    void apiClient.getRevisions(song.id, controller.signal).then(setRevisions).catch(() => setRevisions([]));
    return () => controller.abort();
  }, [isEditor, song?.id]);

  const displayedContent = useMemo(() => (song ? transposeContent(song.content, offset) : ''), [song, offset]);
  const displayedKey = useMemo(() => (song ? transposeChordToken(song.key, offset) : ''), [song, offset]);

  if (error) {
    return <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }

  if (isLoading || !song) {
    return <p className="text-sm text-stone-500 dark:text-stone-400">Loading song...</p>;
  }

  return (
    <div className="grid gap-4 pb-24 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-4">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-5  dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">{song.category?.name ?? 'Uncategorized'}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold">{song.title}</h2>
                {song.isPinned ? (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
                    Pinned
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{song.artist || 'Unknown artist'}</p>
            </div>
            <div className="flex flex-wrap items-start justify-end gap-2">
              {isEditor ? (
                <Link to={`/admin/songs/${song.slug}/edit`} className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white">
                  Edit song
                </Link>
              ) : null}
              {isAdmin ? <SongPinButton songId={song.id} isPinned={song.isPinned} onSuccess={setSong} /> : null}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
            <span className="rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800">Original key {song.key}</span>
            <span className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">Current key {displayedKey}</span>
            {isEditor ? <span className="rounded-full bg-stone-100 px-3 py-1 capitalize dark:bg-stone-800">{song.status}</span> : null}
            <span className="rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800">Updated {formatDate(song.updatedAt)}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
            {song.tags.map((tag) => (
              <span key={tag.id} className="rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800">
                #{tag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-4  dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <TransposeControls offset={offset} onDecrease={() => setOffset((value) => value - 1)} onIncrease={() => setOffset((value) => value + 1)} onReset={() => setOffset(0)} />
            <FontSizeControls fontSize={fontSize} onDecrease={() => setFontSize((value) => Math.max(13, value - 1))} onIncrease={() => setFontSize((value) => Math.min(28, value + 1))} />
          </div>
        </div>

        <ChordSheet content={displayedContent} fontSize={fontSize} />
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {isEditor ? (
          <RevisionList items={revisions} />
        ) : (
          <SuggestionForm onSubmit={(input) => apiClient.suggestCorrection(song.id, input)} />
        )}
      </aside>

      <ActiveLineupFab currentSongSlug={song.slug} />
    </div>
  );
}
