import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { TrackerStudent } from '@music-chords/shared';

import { initialsFor } from './initials';
import { toInstrument, type Instrument } from './instruments';
import type { ChecklistItem, ItemStatus, Student } from './trackerTypes';
import { type ItemKind } from './trackerTypes';
import { apiClient } from '../../api/client';
import { useAuth } from '../../app/AuthProvider';

export interface NewItemDraft {
  kind: ItemKind;
  name: string;
  status: ItemStatus;
  attempts: number;
  notes: string;
}

export interface NewStudentDraft {
  name: string;
  instrument: Instrument;
}

interface TrackerContextValue {
  students: Student[];
  isLoading: boolean;
  /** Last write or load failure, for the banner. Null once a later call succeeds. */
  error: string | null;
  /** True only for admins. Guests and editors read the tracker; they never write to it. */
  canEdit: boolean;
  setItemStatus: (studentId: string, checklistId: string, itemId: string, status: ItemStatus) => void;
  setAttempts: (studentId: string, checklistId: string, itemId: string, attempts: number) => void;
  setNotes: (studentId: string, checklistId: string, itemId: string, notes: string) => void;
  addItem: (studentId: string, checklistId: string, draft: NewItemDraft) => void;
  deleteItem: (studentId: string, checklistId: string, itemId: string) => void;
  /** Re-confirms a passed item today, clearing its review flag. Status and attempts are untouched. */
  confirmReview: (studentId: string, checklistId: string, itemId: string) => void;
  /** Resolves to the new student's id so the caller can navigate straight to them. */
  addStudent: (draft: NewStudentDraft) => Promise<string | null>;
  /** Renames a student or changes their instrument. Checklists are left untouched. */
  updateStudent: (studentId: string, draft: NewStudentDraft) => void;
  /** Removes a student and everything on their checklists. */
  deleteStudent: (studentId: string) => void;
}

const TrackerContext = createContext<TrackerContextValue | null>(null);

/**
 * The API speaks in numeric ids; the tracker's own types use strings, because a checklist row's
 * identity is only ever compared and used as a React key. Converting at this seam keeps every
 * component and the progress/review tests unchanged.
 */
function toStudent(student: TrackerStudent): Student {
  return {
    id: String(student.id),
    name: student.name,
    instrument: toInstrument(student.instrument),
    // Derived, never stored — a rename re-derives it for free.
    avatarInitials: initialsFor(student.name),
    checklists: student.checklists.map((checklist) => ({
      id: String(checklist.id),
      name: checklist.name,
      items: checklist.items.map((item) => ({
        id: String(item.id),
        kind: item.kind,
        name: item.name,
        status: item.status,
        attempts: item.attempts,
        notes: item.notes,
        updatedAt: item.updatedAt
      }))
    }))
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function TrackerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin';

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const items = await apiClient.getTrackerStudents(signal);
      setStudents(items.map(toStudent));
      setError(null);
    } catch (loadError) {
      if (!signal?.aborted) {
        setError(errorMessage(loadError));
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  /**
   * Every mutation paints locally first so the UI stays instant, then persists. A rejected write
   * is never left on screen: the server is re-read, so what you see is what was actually saved.
   */
  const persist = useCallback(
    async (optimistic: (current: Student[]) => Student[], write: () => Promise<unknown>) => {
      setStudents(optimistic);

      try {
        await write();
        setError(null);
      } catch (writeError) {
        setError(errorMessage(writeError));
        await load();
      }
    },
    [load]
  );

  /** Applies `updateItems` to one checklist, leaving every other student and checklist untouched. */
  const mapChecklist = useCallback(
    (studentId: string, checklistId: string, updateItems: (items: ChecklistItem[]) => ChecklistItem[]) =>
      (current: Student[]) =>
        current.map((student) =>
          student.id !== studentId
            ? student
            : {
                ...student,
                checklists: student.checklists.map((checklist) =>
                  checklist.id !== checklistId ? checklist : { ...checklist, items: updateItems(checklist.items) }
                )
              }
        ),
    []
  );

  const patchItem = useCallback(
    (studentId: string, checklistId: string, itemId: string, changes: Partial<ChecklistItem>) => {
      void persist(
        mapChecklist(studentId, checklistId, (items) =>
          items.map((item) => (item.id !== itemId ? item : { ...item, ...changes, updatedAt: new Date().toISOString() }))
        ),
        () =>
          apiClient.updateTrackerItem(Number(itemId), {
            status: changes.status,
            attempts: changes.attempts,
            notes: changes.notes
          })
      );
    },
    [mapChecklist, persist]
  );

  const setItemStatus = useCallback(
    (studentId: string, checklistId: string, itemId: string, status: ItemStatus) => {
      patchItem(studentId, checklistId, itemId, { status });
    },
    [patchItem]
  );

  const setAttempts = useCallback(
    (studentId: string, checklistId: string, itemId: string, attempts: number) => {
      patchItem(studentId, checklistId, itemId, { attempts: Math.max(0, Math.trunc(attempts)) });
    },
    [patchItem]
  );

  const setNotes = useCallback(
    (studentId: string, checklistId: string, itemId: string, notes: string) => {
      patchItem(studentId, checklistId, itemId, { notes });
    },
    [patchItem]
  );

  const addItem = useCallback(
    (studentId: string, checklistId: string, draft: NewItemDraft) => {
      const name = draft.name.trim();
      if (name === '') {
        return;
      }

      const input = {
        kind: draft.kind,
        name,
        status: draft.status,
        attempts: Math.max(0, Math.trunc(draft.attempts)),
        notes: draft.notes.trim()
      };

      // Held only until the created row comes back and hands over its real id.
      const temporaryId = `pending-${Date.now()}`;

      void persist(
        mapChecklist(studentId, checklistId, (items) => [
          ...items,
          { id: temporaryId, ...input, updatedAt: new Date().toISOString() }
        ]),
        async () => {
          const created = await apiClient.createTrackerItem(Number(checklistId), input);
          setStudents(
            mapChecklist(studentId, checklistId, (items) =>
              items.map((item) =>
                item.id !== temporaryId ? item : { ...item, id: String(created.id), updatedAt: created.updatedAt }
              )
            )
          );
        }
      );
    },
    [mapChecklist, persist]
  );

  const deleteItem = useCallback(
    (studentId: string, checklistId: string, itemId: string) => {
      void persist(
        mapChecklist(studentId, checklistId, (items) => items.filter((item) => item.id !== itemId)),
        () => apiClient.deleteTrackerItem(Number(itemId))
      );
    },
    [mapChecklist, persist]
  );

  const confirmReview = useCallback(
    (studentId: string, checklistId: string, itemId: string) => {
      // An empty change set still re-stamps updatedAt, which is the whole point.
      patchItem(studentId, checklistId, itemId, {});
    },
    [patchItem]
  );

  const addStudent = useCallback(
    async (draft: NewStudentDraft) => {
      const name = draft.name.trim();
      if (name === '') {
        return null;
      }

      try {
        // No optimistic row here: the caller navigates straight to the new student, so it needs
        // the real id, and the server is what mints it along with the default checklists.
        const created = await apiClient.createTrackerStudent({ name, instrument: draft.instrument });
        setStudents((current) => [...current, toStudent(created)]);
        setError(null);
        return String(created.id);
      } catch (createError) {
        setError(errorMessage(createError));
        return null;
      }
    },
    []
  );

  const updateStudent = useCallback(
    (studentId: string, draft: NewStudentDraft) => {
      const name = draft.name.trim();
      if (name === '') {
        return;
      }

      void persist(
        (current) =>
          current.map((student) =>
            student.id !== studentId
              ? student
              : // Initials are derived from the name, so a rename has to re-derive them.
                { ...student, name, instrument: draft.instrument, avatarInitials: initialsFor(name) }
          ),
        () => apiClient.updateTrackerStudent(Number(studentId), { name, instrument: draft.instrument })
      );
    },
    [persist]
  );

  const deleteStudent = useCallback(
    (studentId: string) => {
      void persist(
        (current) => current.filter((student) => student.id !== studentId),
        () => apiClient.deleteTrackerStudent(Number(studentId))
      );
    },
    [persist]
  );

  const value = useMemo(
    () => ({
      students,
      isLoading,
      error,
      canEdit,
      setItemStatus,
      setAttempts,
      setNotes,
      addItem,
      deleteItem,
      confirmReview,
      addStudent,
      updateStudent,
      deleteStudent
    }),
    [
      students,
      isLoading,
      error,
      canEdit,
      setItemStatus,
      setAttempts,
      setNotes,
      addItem,
      deleteItem,
      confirmReview,
      addStudent,
      updateStudent,
      deleteStudent
    ]
  );

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used inside a TrackerProvider');
  }

  return context;
}
