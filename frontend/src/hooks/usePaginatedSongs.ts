import { useEffect, useMemo, useRef, useState } from 'react';

import type { SongSummary } from '@music-chords/shared';

import { apiClient } from '../api/client';

const DEFAULT_PAGE_SIZE = 20;

function mergeSongs(existingSongs: SongSummary[], incomingSongs: SongSummary[]) {
  const seenSongIds = new Set(existingSongs.map((song) => song.id));
  const nextSongs = [...existingSongs];

  incomingSongs.forEach((song) => {
    if (!seenSongIds.has(song.id)) {
      seenSongIds.add(song.id);
      nextSongs.push(song);
    }
  });

  return nextSongs;
}

export function usePaginatedSongs({
  q,
  categoryId,
  artist,
  pageSize = DEFAULT_PAGE_SIZE,
  refreshKey = 0
}: {
  q?: string;
  categoryId?: number;
  artist?: string;
  pageSize?: number;
  refreshKey?: number;
}) {
  const [songs, setSongs] = useState<SongSummary[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(true);
  const hasMoreRef = useRef(true);
  const filterKeyRef = useRef('');
  const filterKey = useMemo(
    () => `${q ?? ''}::${categoryId ?? 'all'}::${artist ? artist.toLowerCase() : 'all'}::${refreshKey}`,
    [artist, categoryId, q, refreshKey]
  );

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    isFetchingRef.current = isLoadingInitial || isLoadingMore;
  }, [isLoadingInitial, isLoadingMore]);

  useEffect(() => {
    const loadMoreTarget = loadMoreRef.current;

    if (!loadMoreTarget) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || isFetchingRef.current || !hasMoreRef.current) {
          return;
        }

        isFetchingRef.current = true;
        setPage((currentPage) => currentPage + 1);
      },
      {
        rootMargin: '240px 0px',
        threshold: 0.1
      }
    );

    observer.observe(loadMoreTarget);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (filterKeyRef.current !== filterKey) {
      filterKeyRef.current = filterKey;
      isFetchingRef.current = true;
      setSongs([]);
      setTotal(0);
      setHasMore(true);
      setError(null);
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    const controller = new AbortController();
    const isFirstPage = page === 1;

    const loadSongs = async () => {
      if (isFirstPage) {
        setIsLoadingInitial(true);
      } else {
        setIsLoadingMore(true);
      }

      setError(null);
      isFetchingRef.current = true;

      try {
        const result = await apiClient.getSongs(
          {
            q,
            categoryId,
            artist,
            page,
            pageSize
          },
          controller.signal
        );

        setTotal(result.total);
        setSongs((currentSongs) => {
          const nextSongs = isFirstPage ? result.items : mergeSongs(currentSongs, result.items);
          setHasMore(nextSongs.length < result.total);
          return nextSongs;
        });
      } catch (loadError) {
        if ((loadError as Error).name === 'AbortError') {
          return;
        }

        setHasMore(false);
        setError(loadError instanceof Error ? loadError.message : 'Unable to load songs.');
      } finally {
        if (isFirstPage) {
          setIsLoadingInitial(false);
        } else {
          setIsLoadingMore(false);
        }

        isFetchingRef.current = false;
      }
    };

    void loadSongs();
    return () => controller.abort();
  }, [artist, categoryId, filterKey, page, pageSize, q]);

  return {
    songs,
    total,
    hasMore,
    isLoadingInitial,
    isLoadingMore,
    error,
    loadMoreRef
  };
}
