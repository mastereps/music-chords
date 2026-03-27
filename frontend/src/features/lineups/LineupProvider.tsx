import { createContext, useContext, useEffect, useState } from 'react';

import type { LineupDetail, LineupInput, LineupSummary } from '@music-chords/shared';

import { apiClient } from '../../api/client';
import { useAuth } from '../../app/AuthProvider';

interface LineupContextValue {
  lineups: LineupSummary[];
  activeLineupId: number | null;
  activeLineup: LineupDetail | null;
  isLoading: boolean;
  error: string | null;
  canManageLineups: boolean;
  refreshLineups: () => Promise<void>;
  openLineup: (lineupId: number) => Promise<LineupDetail>;
  clearActiveLineup: () => void;
  createLineup: (input: LineupInput) => Promise<LineupDetail>;
  updateLineup: (lineupId: number, input: LineupInput) => Promise<LineupDetail>;
  deleteLineup: (lineupId: number) => Promise<void>;
}

const LineupContext = createContext<LineupContextValue | null>(null);

function sortLineups(items: LineupSummary[]) {
  return [...items].sort((left, right) => {
    const timeDiff = new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();

    if (timeDiff !== 0) {
      return timeDiff;
    }

    return right.id - left.id;
  });
}

function toLineupSummary(lineup: LineupDetail): LineupSummary {
  return {
    id: lineup.id,
    title: lineup.title,
    description: lineup.description,
    songCount: lineup.songCount,
    createdAt: lineup.createdAt,
    updatedAt: lineup.updatedAt
  };
}

export function LineupProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [lineups, setLineups] = useState<LineupSummary[]>([]);
  const [activeLineupId, setActiveLineupId] = useState<number | null>(null);
  const [activeLineup, setActiveLineup] = useState<LineupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canManageLineups = user?.role === 'admin' || user?.role === 'editor';

  const upsertLineupSummary = (lineup: LineupDetail) => {
    const nextSummary = toLineupSummary(lineup);

    setLineups((currentLineups) => {
      const existing = currentLineups.some((item) => item.id === lineup.id);
      const nextLineups = existing
        ? currentLineups.map((item) => (item.id === lineup.id ? nextSummary : item))
        : [nextSummary, ...currentLineups];

      return sortLineups(nextLineups);
    });
  };

  const clearActiveLineup = () => {
    setActiveLineupId(null);
    setActiveLineup(null);
  };

  const refreshLineups = async () => {
    setIsLoading(true);

    try {
      const items = await apiClient.getLineups();
      setLineups(items);
      setError(null);

      if (activeLineupId && !items.some((lineup) => lineup.id === activeLineupId)) {
        clearActiveLineup();
      } else if (activeLineup) {
        const matchingSummary = items.find((lineup) => lineup.id === activeLineup.id);

        if (matchingSummary) {
          setActiveLineup((currentLineup) =>
            currentLineup && currentLineup.id === matchingSummary.id
              ? {
                  ...currentLineup,
                  title: matchingSummary.title,
                  description: matchingSummary.description,
                  songCount: matchingSummary.songCount,
                  createdAt: matchingSummary.createdAt,
                  updatedAt: matchingSummary.updatedAt
                }
              : currentLineup
          );
        }
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load lineups.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshLineups();
  }, []);

  const openLineup = async (lineupId: number) => {
    const lineup = await apiClient.getLineup(lineupId);
    upsertLineupSummary(lineup);
    setActiveLineupId(lineup.id);
    setActiveLineup(lineup);
    setError(null);
    return lineup;
  };

  const createLineup = async (input: LineupInput) => {
    const lineup = await apiClient.createLineup(input);
    upsertLineupSummary(lineup);
    setActiveLineupId(lineup.id);
    setActiveLineup(lineup);
    setError(null);
    return lineup;
  };

  const updateLineup = async (lineupId: number, input: LineupInput) => {
    const lineup = await apiClient.updateLineup(lineupId, input);
    upsertLineupSummary(lineup);
    setActiveLineupId(lineup.id);
    setActiveLineup(lineup);
    setError(null);
    return lineup;
  };

  const deleteLineup = async (lineupId: number) => {
    await apiClient.deleteLineup(lineupId);
    setLineups((currentLineups) => currentLineups.filter((lineup) => lineup.id !== lineupId));

    if (activeLineupId === lineupId) {
      clearActiveLineup();
    }
  };

  return (
    <LineupContext.Provider
      value={{
        lineups,
        activeLineupId,
        activeLineup,
        isLoading,
        error,
        canManageLineups,
        refreshLineups,
        openLineup,
        clearActiveLineup,
        createLineup,
        updateLineup,
        deleteLineup
      }}
    >
      {children}
    </LineupContext.Provider>
  );
}

export function useLineups() {
  const context = useContext(LineupContext);

  if (!context) {
    throw new Error('useLineups must be used within a LineupProvider.');
  }

  return context;
}
