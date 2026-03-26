import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { DeleteModal } from '../../components/DeleteModal';
import { SearchBar } from '../../components/SearchBar';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
export function AdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [songs, setSongs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('');
    const [categoryId, setCategoryId] = useState(undefined);
    const [selectedSong, setSelectedSong] = useState(null);
    const [publishingSongId, setPublishingSongId] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const debouncedQuery = useDebouncedValue(query, 250);
    const loadSongs = (signal) => apiClient.getSongs({ q: debouncedQuery, status: status || undefined, categoryId, page: 1, pageSize: 25 }, signal);
    const refreshDashboard = async () => {
        const [refreshedStats, refreshedSongs] = await Promise.all([apiClient.getDashboardStats(), loadSongs()]);
        setStats(refreshedStats);
        setSongs(refreshedSongs.items);
    };
    const handlePublish = async (song) => {
        setPublishingSongId(song.id);
        setError(null);
        try {
            await apiClient.updateSongStatus(song.slug, 'published', 'Published from dashboard');
            await refreshDashboard();
        }
        catch (publishError) {
            setError(publishError instanceof Error ? publishError.message : 'Unable to publish song.');
        }
        finally {
            setPublishingSongId(null);
        }
    };
    useEffect(() => {
        const controller = new AbortController();
        void Promise.all([apiClient.getDashboardStats(controller.signal), apiClient.getCategories(controller.signal)])
            .then(([loadedStats, loadedCategories]) => {
            setStats(loadedStats);
            setCategories(loadedCategories);
        })
            .catch((loadError) => {
            if (loadError.name !== 'AbortError') {
                setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard metadata.');
            }
        });
        return () => controller.abort();
    }, []);
    useEffect(() => {
        const controller = new AbortController();
        const loadDashboardSongs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await loadSongs(controller.signal);
                setSongs(result.items);
            }
            catch (loadError) {
                if (loadError.name === 'AbortError') {
                    return;
                }
                setError(loadError instanceof Error ? loadError.message : 'Unable to load songs.');
            }
            finally {
                setIsLoading(false);
            }
        };
        void loadDashboardSongs();
        return () => controller.abort();
    }, [debouncedQuery, status, categoryId]);
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300", children: "Admin area" }), _jsx("h2", { className: "text-2xl font-semibold", children: "Song management" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Link, { to: "/admin/categories", className: "rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold dark:border-stone-700", children: "Categories" }), _jsx(Link, { to: "/admin/songs/new", className: "rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white", children: "New song" })] })] }), _jsx("div", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-5", children: [['Total songs', stats?.totalSongs], ['Published', stats?.publishedSongs], ['Drafts', stats?.draftSongs], ['Categories', stats?.totalCategories], ['Pending suggestions', stats?.pendingSuggestions]].map(([label, value]) => (_jsxs("div", { className: "rounded-3xl border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400", children: label }), _jsx("p", { className: "mt-2 text-3xl font-semibold", children: value ?? '...' })] }, label))) }), _jsx(SearchBar, { value: query, onChange: setQuery, onClear: () => setQuery(''), label: "Search song library", placeholder: "Title, artist, tag, folder", sticky: false }), _jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded-3xl border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900", children: [_jsx("label", { className: "text-sm font-semibold", children: "Status" }), _jsxs("select", { value: status, onChange: (event) => setStatus(event.target.value), className: "rounded-2xl border border-stone-300 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-900", children: [_jsx("option", { value: "", children: "All" }), _jsx("option", { value: "published", children: "Published" }), _jsx("option", { value: "draft", children: "Draft" })] }), _jsx("label", { className: "ml-2 text-sm font-semibold", children: "Folder" }), _jsxs("select", { value: categoryId ?? '', onChange: (event) => setCategoryId(event.target.value ? Number(event.target.value) : undefined), className: "rounded-2xl border border-stone-300 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-900", children: [_jsx("option", { value: "", children: "All folders" }), categories.map((category) => (_jsx("option", { value: category.id, children: category.name }, category.id)))] }), _jsx("span", { className: "ml-auto text-sm text-stone-500 dark:text-stone-400", children: isLoading ? 'Refreshing...' : `${songs.length} songs shown` })] }), error ? _jsx("p", { className: "rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700", children: error }) : null, _jsx("div", { className: "space-y-3", children: songs.map((song) => (_jsx("div", { className: "rounded-3xl border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900", children: _jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("h3", { className: "text-lg font-semibold", children: song.title }), _jsxs("p", { className: "text-sm text-stone-600 dark:text-stone-300", children: [song.artist || 'Unknown artist', " - ", song.status, " - ", song.category?.name ?? 'No folder'] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [song.status === 'draft' ? (_jsx("button", { type: "button", onClick: () => void handlePublish(song), disabled: publishingSongId === song.id, className: "rounded-2xl border border-brand-300 px-4 py-3 text-sm font-semibold text-brand-700 disabled:opacity-60 dark:border-brand-700 dark:text-brand-300", children: publishingSongId === song.id ? 'Publishing...' : 'Publish' })) : null, _jsx(Link, { to: `/songs/${song.slug}`, className: "rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold dark:border-stone-700", children: "View" }), _jsx(Link, { to: `/admin/songs/${song.slug}/edit`, className: "rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white", children: "Edit" }), _jsx("button", { type: "button", onClick: () => setSelectedSong(song), className: "rounded-2xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-700 dark:text-red-300", children: "Delete" })] })] }) }, song.id))) }), _jsx(DeleteModal, { isOpen: Boolean(selectedSong), title: "Delete song", message: `Delete ${selectedSong?.title ?? 'this song'}? This cannot be undone.`, onCancel: () => setSelectedSong(null), onConfirm: async () => {
                    if (!selectedSong) {
                        return;
                    }
                    await apiClient.deleteSong(selectedSong.id);
                    setSelectedSong(null);
                    await refreshDashboard();
                } })] }));
}
