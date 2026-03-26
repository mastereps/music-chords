import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
const emptySong = {
    title: '',
    artist: '',
    key: '',
    slug: '',
    content: '',
    categoryId: null,
    tagIds: [],
    language: '',
    status: 'draft',
    revisionNote: ''
};
function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}
export function SongForm({ categories, tags, initialValue, submitLabel, onSubmit }) {
    const [form, setForm] = useState(initialValue ?? emptySong);
    const [feedback, setFeedback] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => {
        setForm(initialValue ?? emptySong);
    }, [initialValue]);
    const updateField = (key, value) => {
        setForm((current) => ({ ...current, [key]: value }));
    };
    const toggleTag = (tagId) => {
        setForm((current) => ({
            ...current,
            tagIds: current.tagIds.includes(tagId)
                ? current.tagIds.filter((value) => value !== tagId)
                : [...current.tagIds, tagId]
        }));
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setFeedback(null);
        const normalized = {
            ...form,
            title: form.title.trim(),
            key: form.key.trim(),
            slug: form.slug.trim(),
            content: form.content,
            tagIds: [...new Set(form.tagIds)],
            artist: form.artist?.trim() || null,
            language: form.language?.trim() || null,
            revisionNote: form.revisionNote?.trim() || null
        };
        if (!normalized.title || !normalized.key || !normalized.slug || !normalized.content.trim()) {
            setFeedback('Title, key, slug, and chord content are required.');
            setIsSaving(false);
            return;
        }
        try {
            await onSubmit(normalized);
        }
        catch (error) {
            setFeedback(error instanceof Error ? error.message : 'Unable to save song.');
        }
        finally {
            setIsSaving(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsxs("label", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-semibold", children: "Title" }), _jsx("input", { value: form.title, onChange: (event) => updateField('title', event.target.value), className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950", required: true })] }), _jsxs("label", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-semibold", children: "Artist" }), _jsx("input", { value: form.artist ?? '', onChange: (event) => updateField('artist', event.target.value), className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950" })] }), _jsxs("label", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-semibold", children: "Key" }), _jsx("input", { value: form.key, onChange: (event) => updateField('key', event.target.value), className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950", required: true })] }), _jsxs("label", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-semibold", children: "Language" }), _jsx("input", { value: form.language ?? '', onChange: (event) => updateField('language', event.target.value), className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950" })] }), _jsxs("label", { className: "space-y-2 sm:col-span-2", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("span", { className: "text-sm font-semibold", children: "Slug" }), _jsx("button", { type: "button", onClick: () => updateField('slug', slugify(form.title)), className: "text-xs font-semibold text-brand-700 dark:text-brand-300", children: "Generate from title" })] }), _jsx("input", { value: form.slug, onChange: (event) => updateField('slug', event.target.value), className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950", required: true })] }), _jsxs("label", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-semibold", children: "Category" }), _jsxs("select", { value: form.categoryId ?? '', onChange: (event) => updateField('categoryId', event.target.value ? Number(event.target.value) : null), className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950", children: [_jsx("option", { value: "", children: "No category" }), categories.map((category) => (_jsx("option", { value: category.id, children: category.name }, category.id)))] })] }), _jsxs("label", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-semibold", children: "Status" }), _jsxs("select", { value: form.status, onChange: (event) => updateField('status', event.target.value), className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950", children: [_jsx("option", { value: "draft", children: "Draft" }), _jsx("option", { value: "published", children: "Published" })] })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold", children: "Tags" }), _jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: tags.map((tag) => (_jsx("button", { type: "button", onClick: () => toggleTag(tag.id), className: `rounded-full border px-3 py-2 text-sm ${form.tagIds.includes(tag.id)
                                ? 'border-brand-700 bg-brand-700 text-white'
                                : 'border-stone-300 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200'}`, children: tag.name }, tag.id))) })] }), _jsxs("label", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-semibold", children: "Chord sheet content" }), _jsx("textarea", { value: form.content, onChange: (event) => updateField('content', event.target.value), rows: 16, className: "w-full rounded-2xl border border-stone-200 px-4 py-3 font-mono dark:border-stone-700 dark:bg-stone-950", required: true }), _jsx("p", { className: "text-xs text-stone-500 dark:text-stone-400", children: "Keep chords on their own lines where possible so transpose stays accurate and spacing remains readable." })] }), _jsxs("label", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-semibold", children: "Revision note" }), _jsx("input", { value: form.revisionNote ?? '', onChange: (event) => updateField('revisionNote', event.target.value), placeholder: "Example: corrected chorus chords", className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950" })] }), feedback ? _jsx("p", { className: "text-sm text-red-700 dark:text-red-300", children: feedback }) : null, _jsx("button", { type: "submit", disabled: isSaving, className: "rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60", children: isSaving ? 'Saving...' : submitLabel })] }));
}
