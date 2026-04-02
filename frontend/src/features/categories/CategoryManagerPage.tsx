import { useEffect, useState } from 'react';

import type { Category } from '@music-chords/shared';

import { apiClient } from '../../api/client';

const emptyCategory: Omit<Category, 'id'> = {
  name: '',
  slug: '',
  parentId: null,
  sortOrder: 0
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function flattenCategories(categories: Category[], parentId: number | null = null, depth = 0): Array<Category & { depth: number }> {
  return categories
    .filter((category) => category.parentId === parentId)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
    .flatMap((category) => [{ ...category, depth }, ...flattenCategories(categories, category.id, depth + 1)]);
}

export function CategoryManagerPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Omit<Category, 'id'>>(emptyCategory);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form
        onSubmit={async (event) => {
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
            } else {
              await apiClient.createCategory(payload);
              setMessage('Category created.');
            }

            resetForm();
            await loadCategories();
          } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Unable to save category.');
          } finally {
            setIsSaving(false);
          }
        }}
        className="space-y-4 rounded-3xl border border-stone-200 bg-white p-4  dark:border-stone-800 dark:bg-stone-900"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">Categories</p>
          <h2 className="text-2xl font-semibold">Manage folders</h2>
        </div>
        <label className="space-y-2">
          <span className="text-sm font-semibold">Name</span>
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Name" className="w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950" required />
        </label>
        <label className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">Slug</span>
            <button type="button" onClick={() => setForm((current) => ({ ...current, slug: slugify(current.name) }))} className="text-xs font-semibold text-brand-700 dark:text-brand-300">
              Generate
            </button>
          </div>
          <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} placeholder="Slug" className="w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950" required />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">Parent folder</span>
          <select value={form.parentId ?? ''} onChange={(event) => setForm((current) => ({ ...current, parentId: event.target.value ? Number(event.target.value) : null }))} className="w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950">
            <option value="">Top level</option>
            {orderedCategories
              .filter((category) => category.id !== editingId)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {'  '.repeat(category.depth)}{category.name}
                </option>
              ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">Sort order</span>
          <input value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} type="number" placeholder="Sort order" className="w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950" required />
        </label>
        {message ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm text-red-700 dark:text-red-300">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={isSaving} className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {isSaving ? 'Saving...' : editingId ? 'Save category' : 'Add category'}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold dark:border-stone-700">
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="space-y-3">
        {orderedCategories.map((category) => (
          <div key={category.id} className="rounded-3xl border border-stone-200 bg-white p-4  dark:border-stone-800 dark:bg-stone-900">
            <div className="flex flex-wrap items-center justify-between gap-2" style={{ paddingLeft: `${category.depth * 8}px` }}>
              <div>
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="text-sm text-stone-600 dark:text-stone-300">/{category.slug}</p>
                <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">{category.songCount ?? 0} songs - {category.childCount ?? 0} child folders</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(category.id);
                    setForm({
                      name: category.name,
                      slug: category.slug,
                      parentId: category.parentId,
                      sortOrder: category.sortOrder
                    });
                    setError(null);
                    setMessage(null);
                  }}
                  className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold dark:border-stone-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setError(null);
                    setMessage(null);

                    try {
                      await apiClient.deleteCategory(category.id);
                      setMessage('Category deleted.');
                      await loadCategories();
                    } catch (deleteError) {
                      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete category.');
                    }
                  }}
                  className="rounded-2xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-700 dark:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
