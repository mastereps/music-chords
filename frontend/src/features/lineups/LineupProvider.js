import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../app/AuthProvider';
const LineupContext = createContext(null);
function sortLineups(items) {
    return [...items].sort((left, right) => {
        const timeDiff = new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
        if (timeDiff !== 0) {
            return timeDiff;
        }
        return right.id - left.id;
    });
}
function toLineupSummary(lineup) {
    return {
        id: lineup.id,
        title: lineup.title,
        description: lineup.description,
        songCount: lineup.songCount,
        createdAt: lineup.createdAt,
        updatedAt: lineup.updatedAt
    };
}
export function LineupProvider({ children }) {
    const { user } = useAuth();
    const [lineups, setLineups] = useState([]);
    const [activeLineupId, setActiveLineupId] = useState(null);
    const [activeLineup, setActiveLineup] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const canManageLineups = user?.role === 'admin' || user?.role === 'editor';
    const upsertLineupSummary = (lineup) => {
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
            }
            else if (activeLineup) {
                const matchingSummary = items.find((lineup) => lineup.id === activeLineup.id);
                if (matchingSummary) {
                    setActiveLineup((currentLineup) => currentLineup && currentLineup.id === matchingSummary.id
                        ? {
                            ...currentLineup,
                            title: matchingSummary.title,
                            description: matchingSummary.description,
                            songCount: matchingSummary.songCount,
                            createdAt: matchingSummary.createdAt,
                            updatedAt: matchingSummary.updatedAt
                        }
                        : currentLineup);
                }
            }
        }
        catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Unable to load lineups.');
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        void refreshLineups();
    }, []);
    const openLineup = async (lineupId) => {
        const lineup = await apiClient.getLineup(lineupId);
        upsertLineupSummary(lineup);
        setActiveLineupId(lineup.id);
        setActiveLineup(lineup);
        setError(null);
        return lineup;
    };
    const createLineup = async (input) => {
        const lineup = await apiClient.createLineup(input);
        upsertLineupSummary(lineup);
        setActiveLineupId(lineup.id);
        setActiveLineup(lineup);
        setError(null);
        return lineup;
    };
    const updateLineup = async (lineupId, input) => {
        const lineup = await apiClient.updateLineup(lineupId, input);
        upsertLineupSummary(lineup);
        setActiveLineupId(lineup.id);
        setActiveLineup(lineup);
        setError(null);
        return lineup;
    };
    const deleteLineup = async (lineupId) => {
        await apiClient.deleteLineup(lineupId);
        setLineups((currentLineups) => currentLineups.filter((lineup) => lineup.id !== lineupId));
        if (activeLineupId === lineupId) {
            clearActiveLineup();
        }
    };
    return (_jsx(LineupContext.Provider, { value: {
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
        }, children: children }));
}
export function useLineups() {
    const context = useContext(LineupContext);
    if (!context) {
        throw new Error('useLineups must be used within a LineupProvider.');
    }
    return context;
}
