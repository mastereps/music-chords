import type { Lineup, LineupSong } from './lineupTypes';

const LINEUPS_STORAGE_KEY = 'music-chords:lineups';
const ACTIVE_LINEUP_ID_STORAGE_KEY = 'music-chords:active-lineup-id';

function isLineupSong(value: unknown): value is LineupSong {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const song = value as Record<string, unknown>;
  return (
    typeof song.id === 'number' &&
    Number.isFinite(song.id) &&
    typeof song.slug === 'string' &&
    typeof song.title === 'string' &&
    typeof song.key === 'string' &&
    (typeof song.artist === 'string' || song.artist === null)
  );
}

function isLineup(value: unknown): value is Lineup {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const lineup = value as Record<string, unknown>;
  return (
    typeof lineup.id === 'string' &&
    typeof lineup.name === 'string' &&
    typeof lineup.createdAt === 'string' &&
    typeof lineup.updatedAt === 'string' &&
    Array.isArray(lineup.songs) &&
    lineup.songs.every(isLineupSong)
  );
}

export function createLineupId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `lineup-${Date.now()}`;
}

export function loadStoredLineups() {
  if (typeof window === 'undefined') {
    return [] as Lineup[];
  }

  try {
    const rawValue = window.localStorage.getItem(LINEUPS_STORAGE_KEY);

    if (!rawValue) {
      return [] as Lineup[];
    }

    const parsedValue = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsedValue) ? parsedValue.filter(isLineup) : [];
  } catch {
    return [] as Lineup[];
  }
}

export function saveStoredLineups(lineups: Lineup[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LINEUPS_STORAGE_KEY, JSON.stringify(lineups));
}

export function loadStoredActiveLineupId() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(ACTIVE_LINEUP_ID_STORAGE_KEY);
}

export function saveStoredActiveLineupId(lineupId: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!lineupId) {
    window.localStorage.removeItem(ACTIVE_LINEUP_ID_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(ACTIVE_LINEUP_ID_STORAGE_KEY, lineupId);
}

export const lineupStorageKeys = {
  activeLineupId: ACTIVE_LINEUP_ID_STORAGE_KEY,
  lineups: LINEUPS_STORAGE_KEY
};
