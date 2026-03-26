import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
const emptyCategory = {
    name: '',
    slug: '',
    parentId: null,
    sortOrder: 0
};
function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}
function flattenCategories(categories, parentId = null, depth = 0) {
    return categories
        .filter((category) => category.parentId === parentId)
        .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
        .flatMap((category) => [{ ...category, depth }, ...flattenCategories(categories, category.id, depth + 1)]);
}
export function CategoryManagerPage() {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(emptyCategory);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const loadCategories = async () => {
        const items = await apiClient.getCategories();
        setCategories(items);
    };
    useEffect(() => {
        void loadCategories().catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load categories.'));
    }, []);
    const resetForm = () => {
        setForm(emptyCategory);
        setEditingId(null);
    };
    const orderedCategories = flattenCategories(categories);
    return (_jsxs("div", { className: "grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]", children: [_jsxs("form", { onSubmit: async (event) => {
                    event.preventDefault();
                    setIsSaving(true);
                    setError(null);
                    setMessage(null);
                    try {
                        const payload = {
                            ...form,
                            name: form.name.trim(),
                            slug: form.slug.trim() || slugify(form.name),
                            parentId: form.parentId ?? null,
                            sortOrder: Number(form.sortOrder)
                        };
                        if (editingId) {
                            await apiClient.updateCategory(editingId, payload);
                            setMessage('Category updated.');
                        }
                        else {
                            await apiClient.createCategory(payload);
                            setMessage('Category created.');
                        }
                        resetForm();
                        await loadCategories();
                    }
                    catch (saveError) {
                        setError(saveError instanceof Error ? saveError.message : 'Unable to save category.');
                    }
                    finally {
                        setIsSaving(false);
                    }
                }, className: "space-y-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300", children: "Categories" }), _jsx("h2", { className: "text-2xl font-semibold", children: "Manage folders" })] }), _jsxs("label", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-semibold", children: "Name" }), _jsx("input", { value: form.name, onChange: (event) => setForm((current) => ({ ...current, name: event.target.value })), placeholder: "Name", className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950", required: true })] }), _jsxs("label", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("span", { className: "text-sm font-semibold", children: "Slug" }), _jsx("button", { type: "button", onClick: () => setForm((current) => ({ ...current, slug: slugify(current.name) })), className: "text-xs font-semibold text-brand-700 dark:text-brand-300", children: "Generate" })] }), _jsx("input", { value: form.slug, onChange: (event) => setForm((current) => ({ ...current, slug: event.target.value })), placeholder: "Slug", className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950", required: true })] }), _jsxs("label", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-semibold", children: "Parent folder" }), _jsxs("select", { value: form.parentId ?? '', onChange: (event) => setForm((current) => ({ ...current, parentId: event.target.value ? Number(event.target.value) : null })), className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950", children: [_jsx("option", { value: "", children: "Top level" }), orderedCategories
                                        .filter((category) => category.id !== editingId)
                                        .map((category) => (_jsxs("option", { value: category.id, children: ['  '.repeat(category.depth), category.name] }, category.id)))] })] }), _jsxs("label", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-semibold", children: "Sort order" }), _jsx("input", { value: form.sortOrder, onChange: (event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) })), type: "number", placeholder: "Sort order", className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950", required: true })] }), message ? _jsx("p", { className: "text-sm text-emerald-700 dark:text-emerald-300", children: message }) : null, error ? _jsx("p", { className: "text-sm text-red-700 dark:text-red-300", children: error }) : null, _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { type: "submit", disabled: isSaving, className: "rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60", children: isSaving ? 'Saving...' : editingId ? 'Save category' : 'Add category' }), editingId ? (_jsx("button", { type: "button", onClick: resetForm, className: "rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold dark:border-stone-700", children: "Cancel" })) : null] })] }), _jsx("div", { className: "space-y-3", children: orderedCategories.map((category) => (_jsx("div", { className: "rounded-3xl border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", style: { paddingLeft: `${category.depth * 8}px` }, children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: category.name }), _jsxs("p", { className: "text-sm text-stone-600 dark:text-stone-300", children: ["/", category.slug] }), _jsxs("p", { className: "mt-2 text-xs text-stone-500 dark:text-stone-400", children: [category.songCount ?? 0, " songs - ", category.childCount ?? 0, " child folders"] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { type: "button", onClick: () => {
                                            setEditingId(category.id);
                                            setForm({
                                                name: category.name,
                                                slug: category.slug,
                                                parentId: category.parentId,
                                                sortOrder: category.sortOrder
                                            });
                                            setError(null);
                                            setMessage(null);
                                        }, className: "rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold dark:border-stone-700", children: "Edit" }), _jsx("button", { type: "button", onClick: async () => {
                                            setError(null);
                                            setMessage(null);
                                            try {
                                                await apiClient.deleteCategory(category.id);
                                                setMessage('Category deleted.');
                                                await loadCategories();
                                            }
                                            catch (deleteError) {
                                                setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete category.');
                                            }
                                        }, className: "rounded-2xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-700 dark:text-red-300", children: "Delete" })] })] }) }, category.id))) })] }));
}
