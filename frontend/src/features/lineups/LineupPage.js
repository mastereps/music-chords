import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from '../../components/SearchBar';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePaginatedSongs } from '../../hooks/usePaginatedSongs';
import { formatDate } from '../../utils/date';
import { useLineups } from './LineupProvider';
import { toLineupSong } from './lineupTypes';
function getDraftFromLineup(lineup) {
    return {
        id: lineup?.id ?? null,
        name: lineup?.name ?? '',
        songs: lineup?.songs ?? []
    };
}
function haveSongsChanged(left, right) {
    if (left.length !== right.length) {
        return true;
    }
    return left.some((song, index) => {
        const rightSong = right[index];
        return (song.id !== rightSong?.id ||
            song.slug !== rightSong?.slug ||
            song.title !== rightSong?.title ||
            song.artist !== rightSong?.artist ||
            song.key !== rightSong?.key);
    });
}
export function LineupPage() {
    const { lineups, activeLineupId, saveLineup, setActiveLineupId } = useLineups();
    const initialLineup = lineups.find((lineup) => lineup.id === activeLineupId) ?? lineups[0] ?? null;
    const initialDraft = getDraftFromLineup(initialLineup);
    const [draftId, setDraftId] = useState(initialDraft.id);
    const [draftName, setDraftName] = useState(initialDraft.name);
    const [draftSongs, setDraftSongs] = useState(initialDraft.songs);
    const [query, setQuery] = useState('');
    const [searchRefreshKey, setSearchRefreshKey] = useState(0);
    const [editorError, setEditorError] = useState(null);
    const [saveNotice, setSaveNotice] = useState(null);
    const debouncedQuery = useDebouncedValue(query, 250);
    const { songs: songResults, total: songResultsTotal, hasMore, isLoadingInitial: isLoadingSongs, isLoadingMore, error: searchError, loadMoreRef } = usePaginatedSongs({ q: debouncedQuery, refreshKey: searchRefreshKey });
    useEffect(() => {
        if (!draftId) {
            return;
        }
        if (lineups.some((lineup) => lineup.id === draftId)) {
            return;
        }
        const fallbackLineup = lineups.find((lineup) => lineup.id === activeLineupId) ?? lineups[0] ?? null;
        const fallbackDraft = getDraftFromLineup(fallbackLineup);
        setDraftId(fallbackDraft.id);
        setDraftName(fallbackDraft.name);
        setDraftSongs(fallbackDraft.songs);
    }, [activeLineupId, draftId, lineups]);
    const selectedLineup = draftId ? lineups.find((lineup) => lineup.id === draftId) ?? null : null;
    const draftSongIds = useMemo(() => new Set(draftSongs.map((song) => song.id)), [draftSongs]);
    const hasUnsavedChanges = draftId === null
        ? draftName.trim().length > 0 || draftSongs.length > 0
        : !selectedLineup || selectedLineup.name !== draftName.trim() || haveSongsChanged(selectedLineup.songs, draftSongs);
    const handleSelectLineup = (nextLineupId) => {
        if (nextLineupId === 'new') {
            setDraftId(null);
            setDraftName('');
            setDraftSongs([]);
            setEditorError(null);
            setSaveNotice(null);
            return;
        }
        const nextLineup = lineups.find((lineup) => lineup.id === nextLineupId) ?? null;
        const nextDraft = getDraftFromLineup(nextLineup);
        setDraftId(nextDraft.id);
        setDraftName(nextDraft.name);
        setDraftSongs(nextDraft.songs);
        setActiveLineupId(nextLineupId);
        setEditorError(null);
        setSaveNotice(null);
    };
    const handleAddSong = (song) => {
        if (draftSongIds.has(song.id)) {
            return;
        }
        setDraftSongs((currentSongs) => [...currentSongs, toLineupSong(song)]);
        setEditorError(null);
        setSaveNotice(null);
    };
    const handleRemoveSong = (songId) => {
        setDraftSongs((currentSongs) => currentSongs.filter((song) => song.id !== songId));
        setSaveNotice(null);
    };
    const handleResetSearch = () => {
        setQuery('');
        setSearchRefreshKey((currentKey) => currentKey + 1);
    };
    const moveSong = (index, direction) => {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= draftSongs.length) {
            return;
        }
        setDraftSongs((currentSongs) => {
            const nextSongs = [...currentSongs];
            const [movedSong] = nextSongs.splice(index, 1);
            nextSongs.splice(nextIndex, 0, movedSong);
            return nextSongs;
        });
        setSaveNotice(null);
    };
    const handleSave = () => {
        if (!draftName.trim()) {
            setEditorError('Lineup name is required.');
            return;
        }
        if (draftSongs.length === 0) {
            setEditorError('Add at least one song before saving this lineup.');
            return;
        }
        try {
            const savedLineup = saveLineup({
                id: draftId,
                name: draftName,
                songs: draftSongs
            });
            setDraftId(savedLineup.id);
            setDraftName(savedLineup.name);
            setDraftSongs(savedLineup.songs);
            setEditorError(null);
            setSaveNotice(`Saved ${savedLineup.name}. This lineup is now active on this device.`);
        }
        catch (error) {
            setEditorError(error instanceof Error ? error.message : 'Unable to save lineup.');
        }
    };
    return (_jsxs("div", { className: "space-y-4 pb-24", children: [_jsx("section", { className: "rounded-[2rem] border border-stone-200 bg-white p-5 shadow-panel dark:border-stone-800 dark:bg-stone-900", children: _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300", children: "Lineup management" }), _jsx("h1", { className: "mt-2 text-2xl font-semibold text-stone-900 dark:text-white", children: "Build and save a phone-ready song order." }), _jsx("p", { className: "mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300", children: "Choose the active lineup here, edit its songs here, and use the floating popup on each chord page for quick live navigation." })] }), _jsxs("div", { className: "grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-stone-400", children: "Saved lineups" }), _jsxs("select", { value: draftId ?? 'new', onChange: (event) => handleSelectLineup(event.target.value), className: "mt-2 min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base outline-none transition focus:border-brand-500 dark:border-stone-700 dark:bg-stone-950", children: [lineups.length === 0 ? _jsx("option", { value: "new", children: "Create your first lineup" }) : null, lineups.map((lineup) => (_jsx("option", { value: lineup.id, children: lineup.name }, lineup.id))), _jsx("option", { value: "new", children: "New lineup" })] })] }), _jsx("button", { type: "button", onClick: () => handleSelectLineup('new'), className: "min-h-12 w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-brand-500 hover:text-brand-700 dark:border-stone-700 dark:text-stone-200 md:w-auto", children: "New lineup" })] })] }) }), _jsxs("div", { className: "grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]", children: [_jsxs("section", { className: "space-y-4", children: [_jsxs("div", { className: "rounded-[2rem] border border-stone-200 bg-white p-5 shadow-panel dark:border-stone-800 dark:bg-stone-900", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsx("div", { className: "min-w-0 flex-1", children: _jsxs("label", { className: "block", children: [_jsx("span", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-stone-400", children: "Lineup name" }), _jsx("input", { value: draftName, onChange: (event) => {
                                                                setDraftName(event.target.value);
                                                                setSaveNotice(null);
                                                            }, placeholder: "Sunday March 30 Lineup", className: "mt-2 min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base outline-none transition focus:border-brand-500 dark:border-stone-700 dark:bg-stone-950" })] }) }), _jsxs("div", { className: "flex w-full flex-wrap items-center gap-2 pt-0 sm:w-auto sm:pt-6", children: [_jsx("span", { className: "rounded-full bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200", children: draftId && draftId === activeLineupId ? 'Active lineup' : 'Editor only' }), _jsx("button", { type: "button", onClick: handleSave, className: "min-h-12 w-full rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800 sm:w-auto", children: "Save lineup" })] })] }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400", children: [_jsxs("span", { className: "rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800", children: [draftSongs.length, " songs in order"] }), selectedLineup?.updatedAt ? (_jsxs("span", { className: "rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800", children: ["Last saved ", formatDate(selectedLineup.updatedAt)] })) : null, hasUnsavedChanges ? _jsx("span", { className: "rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700", children: "Unsaved changes" }) : null] }), editorError ? _jsx("p", { className: "mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700", children: editorError }) : null, saveNotice ? _jsx("p", { className: "mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:bg-brand-900/40 dark:text-brand-100", children: saveNotice }) : null] }), _jsxs("div", { className: "rounded-[2rem] border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900", children: [_jsx("div", { className: "flex flex-wrap items-start justify-between gap-3", children: _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-stone-900 dark:text-white", children: "Lineup order" }), _jsx("p", { className: "mt-1 text-sm text-stone-500 dark:text-stone-400", children: "This is the only place where songs are added, removed, and reordered." })] }) }), _jsxs("div", { className: "mt-4 space-y-3", children: [draftSongs.length === 0 ? (_jsx("div", { className: "rounded-[1.5rem] border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400", children: "Search the library, then add songs here to build the active lineup." })) : null, draftSongs.map((song, index) => (_jsxs("div", { className: "rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60", children: [_jsxs("div", { className: "flex flex-wrap items-start gap-3", children: [_jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-sm font-semibold text-white", children: index + 1 }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx(Link, { to: `/songs/${song.slug}`, className: "block max-w-[190px] truncate text-base font-semibold text-stone-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-200", children: song.title }), _jsx("p", { className: "mt-1 truncate text-sm text-stone-600 dark:text-stone-300", children: song.artist || 'Unknown artist' })] }), _jsx("span", { className: "shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-stone-900 dark:text-brand-200", children: song.key })] }), _jsxs("div", { className: "mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3", children: [_jsx("button", { type: "button", onClick: () => moveSong(index, -1), disabled: index === 0, className: "min-h-11 rounded-2xl border border-stone-300 px-3 text-sm font-semibold text-stone-700 transition disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-700 dark:text-stone-200", children: "Move up" }), _jsx("button", { type: "button", onClick: () => moveSong(index, 1), disabled: index === draftSongs.length - 1, className: "min-h-11 rounded-2xl border border-stone-300 px-3 text-sm font-semibold text-stone-700 transition disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-700 dark:text-stone-200", children: "Move down" }), _jsx("button", { type: "button", onClick: () => handleRemoveSong(song.id), className: "min-h-11 rounded-2xl border border-red-200 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-300", children: "Remove" })] })] }, song.id)))] })] })] }), _jsxs("aside", { className: "space-y-4 lg:sticky lg:top-24 lg:self-start", children: [_jsx(SearchBar, { value: query, onChange: setQuery, onClear: handleResetSearch, sticky: false, label: "Search song library", placeholder: "Find songs to add to this lineup" }), _jsxs("div", { className: "rounded-[2rem] border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-stone-900 dark:text-white", children: "Library results" }), _jsx("p", { className: "mt-1 text-sm text-stone-500 dark:text-stone-400", children: isLoadingSongs
                                                            ? 'Refreshing songs...'
                                                            : songResultsTotal > songResults.length
                                                                ? `${songResults.length} of ${songResultsTotal} songs ready to add`
                                                                : `${songResults.length} songs ready to add` })] }), debouncedQuery ? _jsxs("span", { className: "basis-full text-xs text-stone-500 dark:text-stone-400 sm:basis-auto", children: ["Search: \"", debouncedQuery, "\""] }) : null] }), searchError ? _jsx("p", { className: "mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700", children: searchError }) : null, _jsxs("div", { className: "mt-4 space-y-3", children: [!isLoadingSongs && songResults.length === 0 ? (_jsx("div", { className: "rounded-[1.5rem] border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400", children: debouncedQuery ? 'No songs matched that search.' : 'No songs are available in the library.' })) : null, songResults.map((song) => {
                                                const isAdded = draftSongIds.has(song.id);
                                                return (_jsxs("div", { className: "rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx(Link, { to: `/songs/${song.slug}`, className: "block max-w-[190px] truncate text-base font-semibold text-stone-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-200", children: song.title }), _jsx("p", { className: "mt-1 truncate text-sm text-stone-600 dark:text-stone-300", children: song.artist || 'Unknown artist' })] }), _jsx("span", { className: "shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-stone-900 dark:text-brand-200", children: song.key })] }), _jsxs("div", { className: "mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between", children: [_jsxs("div", { className: "flex min-w-0 flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400", children: [song.category ? _jsx("span", { className: "max-w-[8rem] truncate rounded-full bg-white px-3 py-1 dark:bg-stone-900 sm:max-w-none", children: song.category.name }) : null, song.language ? _jsx("span", { className: "max-w-[8rem] truncate rounded-full bg-white px-3 py-1 dark:bg-stone-900 sm:max-w-none", children: song.language }) : null] }), _jsx("button", { type: "button", onClick: () => handleAddSong(song), disabled: isAdded, className: "min-h-11 w-full rounded-2xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600 dark:disabled:bg-stone-700 dark:disabled:text-stone-300 sm:w-auto", children: isAdded ? 'Added' : 'Add song' })] })] }, song.id));
                                            }), _jsx("div", { ref: loadMoreRef, "aria-hidden": "true", className: songResults.length > 0 ? 'flex min-h-14 items-center justify-center px-2 py-2 text-sm text-stone-500 dark:text-stone-400' : 'h-px', children: songResults.length > 0
                                                    ? isLoadingMore
                                                        ? 'Loading more songs...'
                                                        : hasMore
                                                            ? 'Scroll to load more songs'
                                                            : 'End of song library'
                                                    : null })] })] })] })] })] }));
}
