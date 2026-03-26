import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { createLineupId, lineupStorageKeys, loadStoredActiveLineupId, loadStoredLineups, saveStoredActiveLineupId, saveStoredLineups } from './lineupStorage';
const LineupContext = createContext(null);
export function LineupProvider({ children }) {
    const [lineups, setLineups] = useState(() => loadStoredLineups());
    const [activeLineupId, setActiveLineupIdState] = useState(() => loadStoredActiveLineupId());
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
        const handleStorage = (event) => {
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
    const setActiveLineupId = (lineupId) => {
        setActiveLineupIdState(lineupId);
    };
    const saveLineup = (input) => {
        const name = input.name.trim();
        if (!name) {
            throw new Error('Lineup name is required.');
        }
        const timestamp = new Date().toISOString();
        const lineupId = input.id ?? createLineupId();
        const savedLineup = {
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
    return (_jsx(LineupContext.Provider, { value: { lineups, activeLineupId, activeLineup, saveLineup, setActiveLineupId }, children: children }));
}
export function useLineups() {
    const context = useContext(LineupContext);
    if (!context) {
        throw new Error('useLineups must be used within a LineupProvider.');
    }
    return context;
}
