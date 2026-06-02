import { useEffect, useRef, useState } from 'react';

import type { Resource, ResourceKind } from '@music-chords/shared';

import { apiClient } from '../../api/client';
import { useAuth } from '../../app/AuthProvider';
import { formatDate } from '../../utils/date';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function KindBadge({ kind }: { kind: ResourceKind }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
        kind === 'pdf'
          ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-200'
          : kind === 'image'
            ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-200'
            : 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
      }`}
    >
      {kind === 'pdf' ? 'PDF' : kind === 'image' ? 'Image' : 'Text'}
    </span>
  );
}

export function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [draftKind, setDraftKind] = useState<ResourceKind>('text');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftText, setDraftText] = useState('');
  const [localFile, setLocalFile] = useState<{ kind: 'pdf' | 'image'; file: File; url: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const controller = new AbortController();

    void apiClient
      .getResources(controller.signal)
      .then((items) => {
        setResources(items);
        setActiveResource((currentResource) => items.find((item) => item.id === currentResource?.id) ?? items[0] ?? null);
      })
      .catch((loadError) => {
        if ((loadError as Error).name !== 'AbortError') {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load resources.');
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    return () => {
      if (localFile) {
        URL.revokeObjectURL(localFile.url);
      }
    };
  }, [localFile]);

  const resetComposer = () => {
    setIsComposerOpen(false);
    setDraftKind('text');
    setDraftTitle('');
    setDraftText('');
    setLocalFile(null);
    setNotice(null);
    setError(null);
  };

  const handlePdfFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Choose a PDF file.');
      return;
    }

    setDraftKind('pdf');
    setLocalFile({ kind: 'pdf', file, url: URL.createObjectURL(file) });
    setDraftTitle(file.name.replace(/\.pdf$/i, ''));
    setNotice('PDF selected. Save the resource to upload it.');
    setError(null);
  };

  const handleImageFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPEG, PNG, or WebP image.');
      return;
    }

    setDraftKind('image');
    setLocalFile({ kind: 'image', file, url: URL.createObjectURL(file) });
    setDraftTitle(file.name.replace(/\.(jpe?g|png|webp)$/i, ''));
    setNotice('Image selected. Save the resource to upload it.');
    setError(null);
  };

  const handleSave = async () => {
    const title = draftTitle.trim();
    const slug = slugify(title);

    if (!title || !slug) {
      setError('Document title is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const saved =
        draftKind === 'pdf'
          ? await apiClient.createPdfResource({
              title,
              slug,
              file: localFile?.kind === 'pdf' ? localFile.file : (() => {
                throw new Error('Choose a PDF file before saving.');
              })()
            })
          : draftKind === 'image'
            ? await apiClient.createImageResource({
                title,
                slug,
                file: localFile?.kind === 'image' ? localFile.file : (() => {
                  throw new Error('Choose an image file before saving.');
                })()
              })
          : await apiClient.createTextResource({ title, slug, bodyText: draftText });

      setResources((currentResources) => [saved, ...currentResources]);
      setActiveResource(saved);
      resetComposer();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save resource.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeResource || !window.confirm(`Delete ${activeResource.title}? This cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.deleteResource(activeResource.id);
      const remainingResources = resources.filter((resource) => resource.id !== activeResource.id);
      setResources(remainingResources);
      setActiveResource(remainingResources[0] ?? null);
      setNotice('Resource deleted.');
      setError(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete resource.');
    }
  };

  const activePdfUrl = activeResource?.kind === 'pdf' ? apiClient.getResourcePdfUrl(activeResource.slug) : null;
  const activeImageUrl = activeResource?.kind === 'image' ? apiClient.getResourceImageUrl(activeResource.slug) : null;
  const previewPdfUrl = isComposerOpen ? (localFile?.kind === 'pdf' ? localFile.url : null) : activePdfUrl;
  const previewImageUrl = isComposerOpen ? (localFile?.kind === 'image' ? localFile.url : null) : activeImageUrl;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredResources = normalizedSearchQuery
    ? resources.filter((resource) =>
        [resource.title, resource.originalFilename ?? '', resource.kind].some((value) =>
          value.toLowerCase().includes(normalizedSearchQuery)
        )
      )
    : resources;

  return (
    <div className="space-y-4 pb-8">
      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-[radial-gradient(circle_at_top_right,_#dbe7d3_0,_#f9f7f0_45%,_#ffffff_100%)] p-5 shadow-panel dark:border-stone-800 dark:bg-[radial-gradient(circle_at_top_right,_#344925_0,_#172014_48%,_#101711_100%)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">Resource room</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-stone-950 dark:text-white sm:text-4xl">
          Ministry documents beside your chord sheets.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">
          View uploaded PDFs, images, and reading notes. Only administrators can add or remove resources.
        </p>
      </section>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p> : null}
      {notice ? <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:bg-brand-900/40 dark:text-brand-100">{notice}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <section className="space-y-3 rounded-[2rem] border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">Library</p>
              <h2 className="mt-1 text-xl font-semibold">Documents</h2>
            </div>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => (isComposerOpen ? resetComposer() : setIsComposerOpen(true))}
                className="rounded-full bg-brand-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-800"
              >
                {isComposerOpen ? 'Close draft' : 'Add document'}
              </button>
            ) : null}
          </div>

          <label className="block">
            <span className="sr-only">Search documents</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search documents"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-brand-500 dark:border-stone-700 dark:bg-stone-950 dark:placeholder:text-stone-500"
            />
          </label>

          {isLoading ? <p className="text-sm text-stone-500 dark:text-stone-400">Loading documents...</p> : null}
          {!isLoading && resources.length === 0 ? <p className="rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">No resources have been added yet.</p> : null}
          {!isLoading && resources.length > 0 && filteredResources.length === 0 ? <p className="rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">No matching documents.</p> : null}

          {filteredResources.map((resource) => (
            <button
              key={resource.id}
              type="button"
              onClick={() => {
                setActiveResource(resource);
                setIsComposerOpen(false);
                setNotice(null);
              }}
              className={`w-full rounded-[1.4rem] border p-4 text-left transition ${
                activeResource?.id === resource.id && !isComposerOpen
                  ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/40'
                  : 'border-stone-200 hover:border-brand-300 dark:border-stone-800 dark:hover:border-brand-700'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <KindBadge kind={resource.kind} />
                <span className="text-[11px] text-stone-500 dark:text-stone-400">Updated {formatDate(resource.updatedAt)}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-stone-900 dark:text-white">{resource.title}</p>
              <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-stone-400">{resource.kind === 'text' ? 'Reading note' : resource.originalFilename}</p>
            </button>
          ))}
        </section>

        {isComposerOpen && isAdmin ? (
          <section className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-panel dark:border-stone-800 dark:bg-stone-900">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">New resource</p>
              <h2 className="mt-2 text-2xl font-semibold">Paste text or upload a file.</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <button type="button" aria-label="Upload PDF" onClick={() => pdfInputRef.current?.click()} className="rounded-[1.3rem] border border-dashed border-brand-400 bg-brand-50 px-4 py-6 text-left dark:bg-brand-900/30">
                  <span className="block text-sm font-semibold text-brand-800 dark:text-brand-100">Upload PDF</span>
                  <span className="mt-2 block text-xs leading-5 text-brand-700 dark:text-brand-200">Select a PDF file from your device.</span>
                </button>
                <input ref={pdfInputRef} type="file" accept="application/pdf,.pdf" onChange={(event) => handlePdfFile(event.target.files?.[0])} className="hidden" />
                <button type="button" aria-label="Upload image" onClick={() => imageInputRef.current?.click()} className="rounded-[1.3rem] border border-dashed border-sky-400 bg-sky-50 px-4 py-6 text-left dark:bg-sky-950/30">
                  <span className="block text-sm font-semibold text-sky-800 dark:text-sky-100">Upload image</span>
                  <span className="mt-2 block text-xs leading-5 text-sky-700 dark:text-sky-200">Select a JPEG, PNG, or WebP image.</span>
                </button>
                <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(event) => handleImageFile(event.target.files?.[0])} className="hidden" />
                <button
                  type="button"
                  aria-label="Paste text"
                  onClick={() => {
                    setDraftKind('text');
                    setLocalFile(null);
                    setNotice('Paste-text resource selected.');
                  }}
                  className="rounded-[1.3rem] border border-amber-200 bg-amber-50 px-4 py-6 text-left dark:border-amber-900 dark:bg-amber-950/40"
                >
                  <span className="block text-sm font-semibold text-amber-900 dark:text-amber-100">Paste text</span>
                  <span className="mt-2 block text-xs leading-5 text-amber-800 dark:text-amber-200">Stored as a readable text document.</span>
                </button>
              </div>

              <label className="mt-5 block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Document title</span>
                <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-stone-700 dark:bg-stone-950" />
              </label>
              {draftKind === 'text' ? (
                <label className="mt-4 block">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Paste document text</span>
                  <textarea value={draftText} onChange={(event) => setDraftText(event.target.value)} rows={16} className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 font-mono text-sm leading-6 outline-none focus:border-brand-500 dark:border-stone-700 dark:bg-stone-950" />
                </label>
              ) : null}
              <button type="button" onClick={() => void handleSave()} disabled={isSaving} className="mt-4 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                {isSaving ? 'Saving...' : 'Save resource'}
              </button>
            </div>

            <ResourceViewer title={draftTitle || 'Untitled document'} bodyText={draftText} pdfUrl={previewPdfUrl} imageUrl={previewImageUrl} />
          </section>
        ) : activeResource ? (
          <section className="space-y-4">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-panel dark:border-stone-800 dark:bg-stone-900">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <KindBadge kind={activeResource.kind} />
                  <h2 className="mt-3 text-2xl font-semibold">{activeResource.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activePdfUrl || activeImageUrl ? (
                    <a href={activePdfUrl ?? activeImageUrl ?? undefined} target="_blank" rel="noreferrer" className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold dark:border-stone-700">
                      Open full screen
                    </a>
                  ) : null}
                  {isAdmin ? (
                    <button type="button" onClick={() => void handleDelete()} className="rounded-2xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-700 dark:text-red-300">
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
            <ResourceViewer title={activeResource.title} bodyText={activeResource.bodyText ?? ''} pdfUrl={activePdfUrl} imageUrl={activeImageUrl} />
          </section>
        ) : (
          <section className="rounded-[2rem] border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
            Select a document when resources are available.
          </section>
        )}
      </div>
    </div>
  );
}

function ResourceViewer({ title, bodyText, pdfUrl, imageUrl }: { title: string; bodyText: string; pdfUrl: string | null; imageUrl: string | null }) {
  return (
    <article className="rounded-[2rem] border border-stone-200 bg-stone-200/60 p-3 shadow-panel dark:border-stone-800 dark:bg-stone-950">
      {pdfUrl ? (
        <>
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[1.3rem] bg-white px-6 py-10 text-center text-stone-950 sm:hidden">
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-700">PDF document</span>
            <h2 className="mt-4 text-xl font-semibold">{title}</h2>
            <p className="mt-3 max-w-xs text-sm leading-6 text-stone-600">
              Mobile browsers open PDF files in a separate viewer for clearer reading.
            </p>
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="mt-5 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white">
              Open PDF
            </a>
          </div>
          <iframe title={`PDF preview: ${title}`} src={pdfUrl} className="hidden min-h-[720px] w-full rounded-[1.3rem] bg-white sm:block" />
        </>
      ) : imageUrl ? (
        <div className="flex min-h-[620px] items-start justify-center rounded-[1.3rem] bg-white p-3">
          <img src={imageUrl} alt={title} className="max-h-[80vh] max-w-full rounded-xl object-contain" />
        </div>
      ) : (
        <div className="min-h-[620px] rounded-[1.3rem] bg-white px-5 py-8 text-stone-950 shadow-sm sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Reading view</p>
          <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
          <pre className="mt-6 whitespace-pre-wrap font-sans text-sm leading-7 text-stone-700">{bodyText || 'Paste document text to preview the reading page.'}</pre>
        </div>
      )}
    </article>
  );
}
