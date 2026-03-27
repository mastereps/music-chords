import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../api/client';
import { ArtistFilterSelect } from '../../components/ArtistFilterSelect';
import { CategoryPills } from '../../components/CategoryPills';
import { SearchBar } from '../../components/SearchBar';
import { SongCard } from '../../components/SongCard';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePaginatedSongs } from '../../hooks/usePaginatedSongs';
const PAGE_SIZE = 20;
const ARTIST_OPTIONS = [
    'Ron Kenoly',
    'Paul Wilbur',
    'Terry MacAlmon',
    'Benny Hinn',
    'Don Moen',
    'Maranatha Music',
    'Hosanna Music',
    'Bethel Music'
];
export function SongsPage() {
    const [query, setQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [activeCategoryId, setActiveCategoryId] = useState(undefined);
    const [selectedArtist, setSelectedArtist] = useState('');
    const debouncedQuery = useDebouncedValue(query, 250);
    const { songs, total, hasMore, isLoadingInitial, isLoadingMore, error, loadMoreRef } = usePaginatedSongs({
        q: debouncedQuery,
        categoryId: activeCategoryId,
        artist: selectedArtist || undefined,
        pageSize: PAGE_SIZE
    });
    useEffect(() => {
        const controller = new AbortController();
        void apiClient.getCategories(controller.signal).then(setCategories).catch(() => setCategories([]));
        return () => controller.abort();
    }, []);
    const activeCategoryName = useMemo(() => categories.find((category) => category.id === activeCategoryId)?.name, [categories, activeCategoryId]);
    const activeResultsLabel = useMemo(() => {
        const activeFilters = [activeCategoryName, selectedArtist].filter(Boolean);
        return activeFilters.length > 0 ? `Filtered by ${activeFilters.join(' / ')}` : 'Across all folders';
    }, [activeCategoryName, selectedArtist]);
    const activeFilterDescription = useMemo(() => {
        const filterParts = [];
        if (debouncedQuery) {
            filterParts.push(`Search: "${debouncedQuery}"`);
        }
        if (activeCategoryName) {
            filterParts.push(`Folder: ${activeCategoryName}`);
        }
        if (selectedArtist) {
            filterParts.push(`Artist: ${selectedArtist}`);
        }
        return filterParts.length > 0 ? filterParts.join(' | ') : 'Use short, specific titles for faster matching.';
    }, [debouncedQuery, activeCategoryName, selectedArtist]);
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("section", { className: "hidden gap-4 sm:grid lg:grid-cols-[1.15fr_0.85fr]", children: [_jsxs("div", { className: "rounded-[2rem] border border-stone-200 bg-white p-5 shadow-panel dark:border-stone-800 dark:bg-stone-900", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300", children: "Chords only" }), _jsx("h2", { className: "mt-2 text-2xl font-semibold sm:text-3xl", children: "Readable chord sheets built for phone screens." }), _jsx("p", { className: "mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300", children: "Search by title, artist, category, tag, or chord content. Open a song fast, transpose it, and keep the layout readable during practice." })] }), _jsxs("div", { className: "rounded-[2rem] border border-stone-200 bg-brand-900 p-5 text-brand-50 shadow-panel", children: [_jsx("p", { className: "text-sm uppercase tracking-[0.25em] text-brand-200", children: "Current results" }), _jsx("p", { className: "mt-3 text-4xl font-semibold", children: total }), _jsx("p", { className: "mt-2 text-sm text-brand-100", children: activeResultsLabel })] })] }), _jsx(SearchBar, { value: query, onChange: setQuery, onClear: () => setQuery('') }), _jsx(ArtistFilterSelect, { artists: ARTIST_OPTIONS, value: selectedArtist, onChange: (artist) => setSelectedArtist(artist) }), _jsx(CategoryPills, { items: categories, activeCategoryId: activeCategoryId, onSelect: setActiveCategoryId }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 px-1 text-sm text-stone-500 dark:text-stone-400", children: [_jsx("span", { children: isLoadingInitial
                            ? 'Loading songs...'
                            : total > songs.length
                                ? `${songs.length} of ${total} songs loaded`
                                : `${songs.length} songs loaded` }), _jsx("span", { children: activeFilterDescription })] }), error ? _jsx("p", { className: "rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700", children: error }) : null, _jsxs("div", { className: "grid w-full gap-3 pb-6", children: [!isLoadingInitial && songs.length === 0 ? (_jsx("div", { className: "rounded-3xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400", children: "No songs matched your current filters." })) : null, songs.map((song) => (_jsx(SongCard, { song: song }, song.id))), _jsx("div", { ref: loadMoreRef, "aria-hidden": "true", className: songs.length > 0 ? 'flex min-h-14 items-center justify-center px-2 py-2 text-sm text-stone-500 dark:text-stone-400' : 'h-px', children: songs.length > 0 ? (isLoadingMore ? 'Loading more songs...' : hasMore ? 'Scroll to load more songs' : 'End of song list') : null })] })] }));
}
