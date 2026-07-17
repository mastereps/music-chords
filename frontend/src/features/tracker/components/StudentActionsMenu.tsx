import { useState } from 'react';

interface StudentActionsMenuProps {
  studentName: string;
  onEdit: () => void;
  onDelete: () => void;
}

/** The "⋮" overflow menu from the reference, next to Add Item. Destructive actions live here. */
export function StudentActionsMenu({ studentName, onEdit, onDelete }: StudentActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`More actions for ${studentName}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-studio-line bg-studio-card text-studio-muted transition hover:text-studio-ink"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>

      {isOpen ? (
        <>
          {/* Catches outside clicks so the menu closes like a native one. */}
          <button type="button" aria-hidden="true" tabIndex={-1} onClick={() => setIsOpen(false)} className="fixed inset-0 z-30 cursor-default" />
          <div role="menu" className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-xl border border-studio-line bg-studio-card py-1 shadow-panel">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-studio-ink transition hover:bg-studio-page"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4z" />
              </svg>
              Edit name & instrument
            </button>
            <div className="my-1 border-t border-studio-line" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
              </svg>
              Delete student
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
