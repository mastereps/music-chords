import { useEffect, useState } from 'react';

import { AttemptsStepper } from './AttemptsStepper';
import { ROW_GRID } from './rowGrid';
import { StatusSelect } from './StatusSelect';
import { formatDate } from '../../../utils/date';
import { daysSince, isReviewDue } from '../review';
import type { ChecklistItem, ItemStatus } from '../trackerTypes';

interface ChecklistRowProps {
  item: ChecklistItem;
  onStatusChange: (status: ItemStatus) => void;
  onAttemptsChange: (attempts: number) => void;
  onNotesChange: (notes: string) => void;
  onDelete: () => void;
  onConfirmReview: () => void;
  /** Guests and editors get the same table without any of the controls. */
  readOnly?: boolean;
}

/** Shown above each control on mobile, where the table header is hidden. */
function FieldLabel({ children }: { children: string }) {
  return <span className="text-[11px] font-semibold uppercase tracking-wide text-studio-muted md:hidden">{children}</span>;
}

export function ChecklistRow({
  item,
  onStatusChange,
  onAttemptsChange,
  onNotesChange,
  onDelete,
  onConfirmReview,
  readOnly = false
}: ChecklistRowProps) {
  const reviewDue = isReviewDue(item);

  // Notes are held locally while typing and saved on blur. Saving per keystroke would be one
  // request per letter, and would re-stamp the review clock mid-word.
  const [draftNotes, setDraftNotes] = useState(item.notes);
  useEffect(() => {
    setDraftNotes(item.notes);
  }, [item.notes]);

  const commitNotes = () => {
    if (draftNotes !== item.notes) {
      onNotesChange(draftNotes);
    }
  };

  return (
    <div
      className={`relative items-center gap-x-4 gap-y-3 border-b border-studio-line/60 px-4 py-3 transition last:border-b-0 hover:bg-studio-page/60 ${ROW_GRID}`}
    >
      <div className="pr-10 md:pr-0">
        <p className="font-medium text-studio-ink">{item.name}</p>
        {reviewDue && item.updatedAt ? (
          <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-status-lacking-soft px-1.5 py-0.5 text-[11px] font-semibold text-status-lacking ring-1 ring-status-lacking/20">
            ↻ Review due · passed {daysSince(item.updatedAt)}d ago
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <FieldLabel>Status</FieldLabel>
        <StatusSelect value={item.status} onChange={onStatusChange} label={`Status for ${item.name}`} disabled={readOnly} />
      </div>

      <div className="flex flex-col gap-1">
        <FieldLabel>Attempts</FieldLabel>
        <AttemptsStepper value={item.attempts} onChange={onAttemptsChange} label={`Attempts for ${item.name}`} disabled={readOnly} />
      </div>

      <div className="flex flex-col gap-1">
        <FieldLabel>Notes</FieldLabel>
        {readOnly ? (
          <p className="text-sm text-studio-ink">{item.notes || <span className="text-studio-muted">—</span>}</p>
        ) : (
          <input
            type="text"
            value={draftNotes}
            placeholder="Add notes..."
            aria-label={`Notes for ${item.name}`}
            onChange={(event) => setDraftNotes(event.target.value)}
            onBlur={commitNotes}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
              }
            }}
            className="w-full rounded-lg border border-studio-line bg-white px-3 py-1.5 text-sm text-studio-ink placeholder:text-studio-muted/70 focus:border-studio-accent/50 focus:outline-none focus:ring-2 focus:ring-studio-accent/20"
          />
        )}
      </div>

      <div className="flex flex-col items-start gap-1">
        <FieldLabel>Last Updated</FieldLabel>
        <span className="text-sm text-studio-muted">{item.updatedAt ? formatDate(item.updatedAt) : '—'}</span>
        {reviewDue && !readOnly ? (
          <button
            type="button"
            onClick={onConfirmReview}
            title="Still solid today — re-confirm and clear the review flag"
            aria-label={`Confirm ${item.name} still passes`}
            className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-studio-accent underline-offset-2 transition hover:bg-studio-lavender hover:underline"
          >
            Confirm
          </button>
        ) : null}
      </div>

      {readOnly ? null : (
      <button
        type="button"
        aria-label={`Delete ${item.name}`}
        onClick={onDelete}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-studio-muted transition hover:bg-red-50 hover:text-red-600 md:static md:right-auto md:top-auto"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
        </svg>
      </button>
      )}
    </div>
  );
}
