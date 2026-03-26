import { useEffect, useState } from 'react';

import type { Category, SongInput, SongStatus, Tag } from '@music-chords/shared';

interface SongFormProps {
  categories: Category[];
  tags: Tag[];
  initialValue?: SongInput;
  submitLabel: string;
  onSubmit: (input: SongInput) => Promise<void>;
}

const emptySong: SongInput = {
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function SongForm({ categories, tags, initialValue, submitLabel, onSubmit }: SongFormProps) {
  const [form, setForm] = useState<SongInput>(initialValue ?? emptySong);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(initialValue ?? emptySong);
  }, [initialValue]);

  const updateField = <K extends keyof SongInput>(key: K, value: SongInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleTag = (tagId: number) => {
    setForm((current) => ({
      ...current,
      tagIds: current.tagIds.includes(tagId)
        ? current.tagIds.filter((value) => value !== tagId)
        : [...current.tagIds, tagId]
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const normalized: SongInput = {
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
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save song.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold">Title</span>
          <input value={form.title} onChange={(event) => updateField('title', event.target.value)} className="w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950" required />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">Artist</span>
          <input value={form.artist ?? ''} onChange={(event) => updateField('artist', event.target.value)} className="w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">Key</span>
          <input value={form.key} onChange={(event) => updateField('key', event.target.value)} className="w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950" required />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">Language</span>
          <input value={form.language ?? ''} onChange={(event) => updateField('language', event.target.value)} className="w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950" />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">Slug</span>
            <button type="button" onClick={() => updateField('slug', slugify(form.title))} className="text-xs font-semibold text-brand-700 dark:text-brand-300">
              Generate from title
            </button>
          </div>
          <input value={form.slug} onChange={(event) => updateField('slug', event.target.value)} className="w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950" required />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">Category</span>
          <select
            value={form.categoryId ?? ''}
            onChange={(event) => updateField('categoryId', event.target.value ? Number(event.target.value) : null)}
            className="w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">Status</span>
          <select
            value={form.status}
            onChange={(event) => updateField('status', event.target.value as SongStatus)}
            className="w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>

      <div>
        <p className="text-sm font-semibold">Tags</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`rounded-full border px-3 py-2 text-sm ${
                form.tagIds.includes(tag.id)
                  ? 'border-brand-700 bg-brand-700 text-white'
                  : 'border-stone-300 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-semibold">Chord sheet content</span>
        <textarea
          value={form.content}
          onChange={(event) => updateField('content', event.target.value)}
          rows={16}
          className="w-full rounded-2xl border border-stone-200 px-4 py-3 font-mono dark:border-stone-700 dark:bg-stone-950"
          required
        />
        <p className="text-xs text-stone-500 dark:text-stone-400">Keep chords on their own lines where possible so transpose stays accurate and spacing remains readable.</p>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold">Revision note</span>
        <input
          value={form.revisionNote ?? ''}
          onChange={(event) => updateField('revisionNote', event.target.value)}
          placeholder="Example: corrected chorus chords"
          className="w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950"
        />
      </label>

      {feedback ? <p className="text-sm text-red-700 dark:text-red-300">{feedback}</p> : null}

      <button type="submit" disabled={isSaving} className="rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {isSaving ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
