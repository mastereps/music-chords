import { createContext, useContext, useEffect, useState } from 'react';

import type { Lineup, LineupInput } from './lineupTypes';
import {
  createLineupId,
  lineupStorageKeys,
  loadStoredActiveLineupId,
  loadStoredLineups,
  saveStoredActiveLineupId,
  saveStoredLineups
} from './lineupStorage';

interface LineupContextValue {
  lineups: Lineup[];
  activeLineupId: string | null;
  activeLineup: Lineup | null;
  saveLineup: (input: LineupInput) => Lineup;
  setActiveLineupId: (lineupId: string | null) => void;
}

const LineupContext = createContext<LineupContextValue | null>(null);

export function LineupProvider({ children }: { children: React.ReactNode }) {
  const [lineups, setLineups] = useState<Lineup[]>(() => loadStoredLineups());
  const [activeLineupId, setActiveLineupIdState] = useState<string | null>(() => loadStoredActiveLineupId());

  useEffect(() => {
    saveStoredLineups(lineups);
  }, [lineups]);

  useEffect(() => {
    if (activeLineupId && !lineups.some((lineup) => lineup.id === activeLineupId)) {
      setActiveLineupIdState(lineups[0]?.id ?? null);
    }
  }, [activeLineupId, lineups]);

  useEffect(() => {
    saveStoredActiveLineupId(activeLineupId);
  }, [activeLineupId]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === lineupStorageKeys.lineups) {
        setLineups(loadStoredLineups());
      }

      if (event.key === lineupStorageKeys.activeLineupId) {
        setActiveLineupIdState(loadStoredActiveLineupId());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const activeLineup = lineups.find((lineup) => lineup.id === activeLineupId) ?? null;

  const setActiveLineupId = (lineupId: string | null) => {
    setActiveLineupIdState(lineupId);
  };

  const saveLineup = (input: LineupInput) => {
    const name = input.name.trim();

    if (!name) {
      throw new Error('Lineup name is required.');
    }

    const timestamp = new Date().toISOString();
    const lineupId = input.id ?? createLineupId();
    const savedLineup: Lineup = {
      id: lineupId,
      name,
      songs: input.songs,
      createdAt: lineups.find((lineup) => lineup.id === lineupId)?.createdAt ?? timestamp,
      updatedAt: timestamp
    };

    setLineups((currentLineups) => {
      const existingIndex = currentLineups.findIndex((lineup) => lineup.id === lineupId);

      if (existingIndex === -1) {
        return [savedLineup, ...currentLineups];
      }

      return currentLineups.map((lineup) => (lineup.id === lineupId ? savedLineup : lineup));
    });

    setActiveLineupIdState(lineupId);

    return savedLineup;
  };

  return (
    <LineupContext.Provider value={{ lineups, activeLineupId, activeLineup, saveLineup, setActiveLineupId }}>
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
