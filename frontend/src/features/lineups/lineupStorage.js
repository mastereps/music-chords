// Legacy compatibility shim. Lineups are now API-backed and active lineup state stays in memory.
export function createLineupId() {
    return `lineup-${Date.now()}`;
}
export function loadStoredLineups() {
    return [];
}
export function saveStoredLineups(_lineups) { }
export function loadStoredActiveLineupId() {
    return null;
}
export function saveStoredActiveLineupId(_lineupId) { }
export const lineupStorageKeys = {
    activeLineupId: 'deprecated',
    lineups: 'deprecated'
};
