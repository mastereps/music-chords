import type { LineupDetail as Lineup } from '@music-chords/shared';

// Legacy compatibility shim. Lineups are now API-backed and active lineup state stays in memory.
export function createLineupId() {
  return `lineup-${Date.now()}`;
}

export function loadStoredLineups() {
  return [] as Lineup[];
}

export function saveStoredLineups(_lineups: Lineup[]) {}

export function loadStoredActiveLineupId() {
  return null;
}

export function saveStoredActiveLineupId(_lineupId: string | null) {}

export const lineupStorageKeys = {
  activeLineupId: 'deprecated',
  lineups: 'deprecated'
};
