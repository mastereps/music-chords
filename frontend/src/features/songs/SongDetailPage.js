import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { transposeChordToken, transposeContent } from '@music-chords/shared';
import { useAuth } from '../../app/AuthProvider';
import { apiClient } from '../../api/client';
import { ChordSheet } from '../../components/ChordSheet';
import { FontSizeControls } from '../../components/FontSizeControls';
import { RevisionList } from '../../components/RevisionList';
import { SuggestionForm } from '../../components/SuggestionForm';
import { TransposeControls } from '../../components/TransposeControls';
import { ActiveLineupFab } from '../lineups/ActiveLineupFab';
import { formatDate } from '../../utils/date';
export function SongDetailPage() {
    const { slug = '' } = useParams();
    const { user } = useAuth();
    const [song, setSong] = useState(null);
    const [revisions, setRevisions] = useState([]);
    const [offset, setOffset] = useState(0);
    const [fontSize, setFontSize] = useState(17);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const isEditor = user?.role === 'admin' || user?.role === 'editor';
    useEffect(() => {
        const controller = new AbortController();
        setIsLoading(true);
        setError(null);
        void apiClient
            .getSong(slug, controller.signal)
            .then((loadedSong) => {
            setSong(loadedSong);
            setOffset(0);
        })
            .catch((loadError) => {
            if (loadError.name === 'AbortError') {
                return;
            }
            setError(loadError instanceof Error ? loadError.message : 'Unable to load song.');
        })
            .finally(() => setIsLoading(false));
        return () => controller.abort();
    }, [slug]);
    useEffect(() => {
        if (!song || !isEditor) {
            setRevisions([]);
            return;
        }
        const controller = new AbortController();
        void apiClient.getRevisions(song.id, controller.signal).then(setRevisions).catch(() => setRevisions([]));
        return () => controller.abort();
    }, [song, isEditor]);
    const displayedContent = useMemo(() => (song ? transposeContent(song.content, offset) : ''), [song, offset]);
    const displayedKey = useMemo(() => (song ? transposeChordToken(song.key, offset) : ''), [song, offset]);
    if (error) {
        return _jsx("p", { className: "rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700", children: error });
    }
    if (isLoading || !song) {
        return _jsx("p", { className: "text-sm text-stone-500 dark:text-stone-400", children: "Loading song..." });
    }
    return (_jsxs("div", { className: "grid gap-4 pb-24 lg:grid-cols-[minmax(0,1fr)_320px]", children: [_jsxs("section", { className: "space-y-4", children: [_jsxs("div", { className: "rounded-[2rem] border border-stone-200 bg-white p-5 shadow-panel dark:border-stone-800 dark:bg-stone-900", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300", children: song.category?.name ?? 'Uncategorized' }), _jsx("h2", { className: "mt-2 text-2xl font-semibold", children: song.title }), _jsx("p", { className: "mt-1 text-sm text-stone-600 dark:text-stone-300", children: song.artist || 'Unknown artist' })] }), isEditor ? (_jsx(Link, { to: `/admin/songs/${song.slug}/edit`, className: "rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white", children: "Edit song" })) : null] }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400", children: [_jsxs("span", { className: "rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800", children: ["Original key ", song.key] }), _jsxs("span", { className: "rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200", children: ["Current key ", displayedKey] }), isEditor ? _jsx("span", { className: "rounded-full bg-stone-100 px-3 py-1 capitalize dark:bg-stone-800", children: song.status }) : null, _jsxs("span", { className: "rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800", children: ["Updated ", formatDate(song.updatedAt)] })] }), _jsx("div", { className: "mt-4 flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400", children: song.tags.map((tag) => (_jsxs("span", { className: "rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800", children: ["#", tag.name] }, tag.id))) })] }), _jsx("div", { className: "rounded-[2rem] border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsx(TransposeControls, { offset: offset, onDecrease: () => setOffset((value) => value - 1), onIncrease: () => setOffset((value) => value + 1), onReset: () => setOffset(0) }), _jsx(FontSizeControls, { fontSize: fontSize, onDecrease: () => setFontSize((value) => Math.max(13, value - 1)), onIncrease: () => setFontSize((value) => Math.min(28, value + 1)) })] }) }), _jsx(ChordSheet, { content: displayedContent, fontSize: fontSize })] }), _jsx("aside", { className: "space-y-4 lg:sticky lg:top-24 lg:self-start", children: isEditor ? (_jsx(RevisionList, { items: revisions })) : (_jsx(SuggestionForm, { onSubmit: (input) => apiClient.suggestCorrection(song.id, input) })) }), _jsx(ActiveLineupFab, { currentSongSlug: song.slug })] }));
}
