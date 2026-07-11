import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type { LiveSongView, LiveState } from '@music-chords/shared';

import { apiClient } from '../../api/client';
import { useAuth } from '../../app/AuthProvider';

interface LiveContextValue {
  liveState: LiveState | null;
  isPresenting: boolean;
  isFollowing: boolean;
  songView: LiveSongView | null;
  canPresent: boolean;
  startPresenting: () => void;
  stopPresenting: () => Promise<void>;
  setFollowing: (following: boolean) => void;
  reportSongView: (view: LiveSongView | null) => void;
}

const LiveContext = createContext<LiveContextValue | undefined>(undefined);

export function LiveProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [liveState, setLiveState] = useState<LiveState | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(true);
  const [songView, setSongView] = useState<LiveSongView | null>(null);
  const wasActiveRef = useRef(false);

  useEffect(() => {
    const source = new EventSource(apiClient.getLiveStreamUrl());

    source.onmessage = (event) => {
      try {
        const nextState = JSON.parse(event.data) as LiveState;

        // A new live session always starts everyone in follow mode.
        if (nextState.active && !wasActiveRef.current) {
          setIsFollowing(true);
        }

        wasActiveRef.current = nextState.active;
        setLiveState(nextState);
      } catch {
        // Ignore malformed events.
      }
    };

    return () => source.close();
  }, []);

  const canPresent = user?.role === 'admin';

  const value = useMemo<LiveContextValue>(
    () => ({
      liveState,
      isPresenting,
      isFollowing,
      songView,
      canPresent,
      startPresenting: () => {
        setIsPresenting(true);
      },
      stopPresenting: async () => {
        setIsPresenting(false);
        setSongView(null);
        try {
          await apiClient.updateLiveState({ active: false, songView: null });
        } catch {
          // Ending live is best-effort; the SSE state will reflect reality.
        }
      },
      setFollowing: setIsFollowing,
      reportSongView: setSongView
    }),
    [liveState, isPresenting, isFollowing, songView, canPresent]
  );

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive() {
  const context = useContext(LiveContext);

  if (!context) {
    throw new Error('useLive must be used within LiveProvider');
  }

  return context;
}
