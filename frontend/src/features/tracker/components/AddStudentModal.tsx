import { useState, type FormEvent } from 'react';

import { StudentAvatar } from './StudentAvatar';
import { initialsFor } from '../initials';
import type { NewStudentDraft } from '../TrackerProvider';
import { INSTRUMENTS, instrumentStyle, type Instrument } from '../instruments';
import { DEFAULT_CHECKLIST_NAMES } from '../trackerTypes';

interface AddStudentModalProps {
  isOpen: boolean;
  onAdd: (draft: NewStudentDraft) => void;
  onCancel: () => void;
}

const FIELD_CLASSES =
  'w-full rounded-xl border border-studio-line bg-white px-3 py-2.5 text-sm text-studio-ink placeholder:text-studio-muted/70 focus:border-studio-accent/50 focus:outline-none focus:ring-2 focus:ring-studio-accent/20';

const LABEL_CLASSES = 'mb-1.5 block text-xs font-semibold text-studio-muted';

export function AddStudentModal({ isOpen, onAdd, onCancel }: AddStudentModalProps) {
  const [name, setName] = useState('');
  const [instrument, setInstrument] = useState<Instrument>('Piano');
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  function reset() {
    setName('');
    setInstrument('Piano');
    setError('');
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (name.trim() === '') {
      setError("Give the student a name.");
      return;
    }

    onAdd({ name, instrument });
    reset();
  }

  function handleCancel() {
    reset();
    onCancel();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="add-student-title" className="w-full max-w-lg rounded-3xl bg-studio-card p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-student-title" className="font-display text-2xl font-semibold text-studio-gold">
              Add Student
            </h2>
            <p className="mt-1 text-sm text-studio-muted">They will start with the three standard checklists, ready to fill in.</p>
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
          <div className="flex items-center gap-4">
            <StudentAvatar initials={name.trim() === '' ? '?' : initialsFor(name)} instrument={instrument} size="sm" />
            <div className="min-w-0 flex-1">
              <label htmlFor="add-student-name" className={LABEL_CLASSES}>
                Student Name
              </label>
              <input
                id="add-student-name"
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
            <label htmlFor="add-student-instrument" className={LABEL_CLASSES}>
              Instrument
            </label>
            <select
              id="add-student-instrument"
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

          <p className="mt-3 text-xs text-studio-muted">Checklists: {DEFAULT_CHECKLIST_NAMES.join(', ')}</p>

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
            <button type="submit" className="rounded-xl bg-studio-gold px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-studio-gold/90">
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
