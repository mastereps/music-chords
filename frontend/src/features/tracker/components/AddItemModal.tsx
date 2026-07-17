import { useState, type FormEvent } from 'react';

import { AttemptsStepper } from './AttemptsStepper';
import type { NewItemDraft } from '../TrackerProvider';
import { ITEM_KINDS, ITEM_STATUSES, KIND_LABELS, STATUS_LABELS, type ItemKind, type ItemStatus } from '../trackerTypes';

interface AddItemModalProps {
  isOpen: boolean;
  checklistName: string;
  onAdd: (draft: NewItemDraft) => void;
  onCancel: () => void;
}

const FIELD_CLASSES =
  'w-full rounded-xl border border-studio-line bg-white px-3 py-2.5 text-sm text-studio-ink placeholder:text-studio-muted/70 focus:border-studio-accent/50 focus:outline-none focus:ring-2 focus:ring-studio-accent/20';

const LABEL_CLASSES = 'mb-1.5 block text-xs font-semibold text-studio-muted';

const GROUP_FOR_KIND: Record<ItemKind, string> = {
  skill: 'Skills',
  piece: 'Pieces',
  passage: 'Passages'
};

export function AddItemModal({ isOpen, checklistName, onAdd, onCancel }: AddItemModalProps) {
  const [kind, setKind] = useState<ItemKind>('skill');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<ItemStatus>('not_started');
  const [attempts, setAttempts] = useState(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  function reset() {
    setKind('skill');
    setName('');
    setStatus('not_started');
    setAttempts(0);
    setNotes('');
    setError('');
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (name.trim() === '') {
      setError('Give the item a name.');
      return;
    }

    onAdd({ kind, name, status, attempts, notes });
    reset();
  }

  function handleCancel() {
    reset();
    onCancel();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="add-item-title" className="w-full max-w-lg rounded-3xl bg-studio-card p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-item-title" className="font-display text-2xl font-semibold text-studio-accent">
              Add Item
            </h2>
            <p className="mt-1 text-sm text-studio-muted">
              Under: {checklistName} &gt; {GROUP_FOR_KIND[kind]}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={handleCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-studio-muted transition hover:bg-studio-line hover:text-studio-ink"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 rounded-2xl border border-studio-line bg-white/60 p-4">
          <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)]">
            <div>
              <label htmlFor="add-item-kind" className={LABEL_CLASSES}>
                Type
              </label>
              <select id="add-item-kind" value={kind} onChange={(event) => setKind(event.target.value as ItemKind)} className={FIELD_CLASSES}>
                {ITEM_KINDS.map((option) => (
                  <option key={option} value={option}>
                    {KIND_LABELS[option]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="add-item-name" className={LABEL_CLASSES}>
                Item Name
              </label>
              <input
                id="add-item-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError('');
                }}
                placeholder="e.g., Can read dotted notes"
                className={FIELD_CLASSES}
              />
            </div>

            <div>
              <label htmlFor="add-item-status" className={LABEL_CLASSES}>
                Status
              </label>
              <select
                id="add-item-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as ItemStatus)}
                className={FIELD_CLASSES}
              >
                {ITEM_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {STATUS_LABELS[option]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className={LABEL_CLASSES}>Attempts</span>
              <AttemptsStepper value={attempts} onChange={setAttempts} label="Attempts for new item" />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="add-item-notes" className={LABEL_CLASSES}>
              Notes
            </label>
            <input
              id="add-item-notes"
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add notes (optional)..."
              className={FIELD_CLASSES}
            />
          </div>

          {error ? (
            <p role="alert" className="mt-3 text-sm font-medium text-red-600">
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-studio-line px-4 py-2.5 text-sm font-semibold text-studio-ink transition hover:bg-studio-page"
            >
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-studio-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-studio-accent/90">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
