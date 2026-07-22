import { useState, type FormEvent } from 'react';

import { StudentAvatar } from './StudentAvatar';
import { initialsFor } from '../initials';
import type { NewStudentDraft } from '../TrackerProvider';
import { INSTRUMENTS, instrumentStyle, type Instrument } from '../instruments';
import { DEFAULT_CHECKLIST_NAMES } from '../trackerTypes';

interface StudentFormModalProps {
  mode: 'add' | 'edit';
  /** Prefilled when editing; ignored on add. */
  initialName?: string;
  initialInstrument?: Instrument;
  onSubmit: (draft: NewStudentDraft) => void;
  onCancel: () => void;
}

const FIELD_CLASSES =
  'w-full rounded-xl border border-studio-line bg-studio-page px-3 py-2.5 text-sm text-studio-ink placeholder:text-studio-muted/70 focus:border-studio-accent/50 focus:outline-none focus:ring-2 focus:ring-studio-accent/20';

const LABEL_CLASSES = 'mb-1.5 block text-xs font-semibold text-studio-muted';

/**
 * One form for both adding and editing a student. The parent mounts it only while open,
 * so each opening starts from fresh state — no reset plumbing needed.
 */
export function StudentFormModal({ mode, initialName = '', initialInstrument = 'Piano', onSubmit, onCancel }: StudentFormModalProps) {
  const [name, setName] = useState(initialName);
  const [instrument, setInstrument] = useState<Instrument>(initialInstrument);
  const [error, setError] = useState('');

  const isEdit = mode === 'edit';
  const accent = isEdit ? 'text-studio-accent' : 'text-studio-gold';
  const submitButton = isEdit ? 'bg-studio-accent hover:bg-studio-accent/90' : 'bg-studio-gold hover:bg-studio-gold/90';

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (name.trim() === '') {
      setError('Give the student a name.');
      return;
    }

    onSubmit({ name, instrument });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="student-form-title" className="w-full max-w-lg rounded-3xl border border-studio-line bg-studio-card p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="student-form-title" className={`font-display text-2xl font-semibold ${accent}`}>
              {isEdit ? 'Edit Student' : 'Add Student'}
            </h2>
            <p className="mt-1 text-sm text-studio-muted">
              {isEdit
                ? 'Their checklists, notes, and attempts stay exactly as they are.'
                : 'They will start with the three standard checklists, ready to fill in.'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-studio-muted transition hover:bg-studio-line hover:text-studio-ink"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 rounded-2xl border border-studio-line bg-white/5 p-4">
          <div className="flex items-center gap-4">
            <StudentAvatar initials={name.trim() === '' ? '?' : initialsFor(name)} instrument={instrument} size="sm" />
            <div className="min-w-0 flex-1">
              <label htmlFor="student-form-name" className={LABEL_CLASSES}>
                Student Name
              </label>
              <input
                id="student-form-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError('');
                }}
                placeholder="e.g., Noah Bennett"
                className={FIELD_CLASSES}
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="student-form-instrument" className={LABEL_CLASSES}>
              Instrument
            </label>
            <select
              id="student-form-instrument"
              value={instrument}
              onChange={(event) => setInstrument(event.target.value as Instrument)}
              className={FIELD_CLASSES}
            >
              {INSTRUMENTS.map((option) => (
                <option key={option} value={option}>
                  {instrumentStyle(option).badge} {option}
                </option>
              ))}
            </select>
          </div>

          {isEdit ? null : <p className="mt-3 text-xs text-studio-muted">Checklists: {DEFAULT_CHECKLIST_NAMES.join(', ')}</p>}

          {error ? (
            <p role="alert" className="mt-3 text-sm font-medium text-red-400">
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-studio-line px-4 py-2.5 text-sm font-semibold text-studio-ink transition hover:bg-studio-page"
            >
              Cancel
            </button>
            <button type="submit" className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${submitButton}`}>
              {isEdit ? 'Save Changes' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
