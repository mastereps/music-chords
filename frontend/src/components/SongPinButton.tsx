import { useState } from 'react';

import type { SongDetail } from '@music-chords/shared';

import { apiClient } from '../api/client';
import { useAuth } from '../app/AuthProvider';

interface SongPinButtonProps {
  songId: number;
  isPinned: boolean;
  className?: string;
  onSuccess?: (updatedSong: SongDetail) => void;
}

export function SongPinButton({ songId, isPinned, className, onSuccess }: SongPinButtonProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return null;
  }

  const nextPinnedState = !isPinned;
  const label = isPinned ? 'Unpin' : 'Pin';

  const handleClick = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedSong = await apiClient.setSongPinned(songId, { pinned: nextPinnedState });
      onSuccess?.(updatedSong);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : `Unable to ${label.toLowerCase()} song.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={isSubmitting}
        className={className ?? 'rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:text-stone-200 dark:hover:border-brand-400 dark:hover:text-brand-200'}
      >
        {isSubmitting ? 'Saving...' : label}
      </button>
      {error ? <p className="text-right text-[11px] text-red-600 dark:text-red-300">{error}</p> : null}
    </div>
  );
}
