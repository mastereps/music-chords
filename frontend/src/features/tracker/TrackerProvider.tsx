import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { initialsFor } from './initials';
import { mockStudents } from './mockData';
import type { Instrument } from './instruments';
import { DEFAULT_CHECKLIST_NAMES, type ChecklistItem, type ItemKind, type ItemStatus, type Student } from './trackerTypes';

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
  setItemStatus: (studentId: string, checklistId: string, itemId: string, status: ItemStatus) => void;
  setAttempts: (studentId: string, checklistId: string, itemId: string, attempts: number) => void;
  setNotes: (studentId: string, checklistId: string, itemId: string, notes: string) => void;
  addItem: (studentId: string, checklistId: string, draft: NewItemDraft) => void;
  deleteItem: (studentId: string, checklistId: string, itemId: string) => void;
  /** Re-confirms a passed item today, clearing its review flag. Status and attempts are untouched. */
  confirmReview: (studentId: string, checklistId: string, itemId: string) => void;
  /** Returns the new student's id so the caller can navigate straight to them. */
  addStudent: (draft: NewStudentDraft) => string | null;
  /** Renames a student or changes their instrument. Checklists are left untouched. */
  updateStudent: (studentId: string, draft: NewStudentDraft) => void;
  /** Removes a student and everything on their checklists. */
  deleteStudent: (studentId: string) => void;
}

const TrackerContext = createContext<TrackerContextValue | null>(null);

let itemSequence = 0;
let studentSequence = 0;

function nextItemId() {
  itemSequence += 1;
  return `item-${Date.now()}-${itemSequence}`;
}


export function TrackerProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(mockStudents);

  /** Applies `updateItems` to one checklist, leaving every other student and checklist untouched. */
  const updateChecklist = useCallback(
    (studentId: string, checklistId: string, updateItems: (items: ChecklistItem[]) => ChecklistItem[]) => {
      setStudents((current) =>
        current.map((student) =>
          student.id !== studentId
            ? student
            : {
                ...student,
                checklists: student.checklists.map((checklist) =>
                  checklist.id !== checklistId ? checklist : { ...checklist, items: updateItems(checklist.items) }
                )
              }
        )
      );
    },
    []
  );

  const updateItem = useCallback(
    (studentId: string, checklistId: string, itemId: string, changes: Partial<ChecklistItem>) => {
      updateChecklist(studentId, checklistId, (items) =>
        items.map((item) => (item.id !== itemId ? item : { ...item, ...changes, updatedAt: new Date().toISOString() }))
      );
    },
    [updateChecklist]
  );

  const setItemStatus = useCallback(
    (studentId: string, checklistId: string, itemId: string, status: ItemStatus) => {
      updateItem(studentId, checklistId, itemId, { status });
    },
    [updateItem]
  );

  const setAttempts = useCallback(
    (studentId: string, checklistId: string, itemId: string, attempts: number) => {
      updateItem(studentId, checklistId, itemId, { attempts: Math.max(0, Math.trunc(attempts)) });
    },
    [updateItem]
  );

  const setNotes = useCallback(
    (studentId: string, checklistId: string, itemId: string, notes: string) => {
      updateItem(studentId, checklistId, itemId, { notes });
    },
    [updateItem]
  );

  const addItem = useCallback(
    (studentId: string, checklistId: string, draft: NewItemDraft) => {
      const name = draft.name.trim();
      if (name === '') {
        return;
      }

      const item: ChecklistItem = {
        id: nextItemId(),
        kind: draft.kind,
        name,
        status: draft.status,
        attempts: Math.max(0, Math.trunc(draft.attempts)),
        notes: draft.notes.trim(),
        updatedAt: new Date().toISOString()
      };

      updateChecklist(studentId, checklistId, (items) => [...items, item]);
    },
    [updateChecklist]
  );

  const deleteItem = useCallback(
    (studentId: string, checklistId: string, itemId: string) => {
      updateChecklist(studentId, checklistId, (items) => items.filter((item) => item.id !== itemId));
    },
    [updateChecklist]
  );

  const confirmReview = useCallback(
    (studentId: string, checklistId: string, itemId: string) => {
      // An empty change set still re-stamps updatedAt, which is the whole point.
      updateItem(studentId, checklistId, itemId, {});
    },
    [updateItem]
  );

  const addStudent = useCallback((draft: NewStudentDraft) => {
    const name = draft.name.trim();
    if (name === '') {
      return null;
    }

    studentSequence += 1;
    const id = `student-${Date.now()}-${studentSequence}`;
    const student: Student = {
      id,
      name,
      instrument: draft.instrument,
      avatarInitials: initialsFor(name),
      checklists: DEFAULT_CHECKLIST_NAMES.map((checklistName, index) => ({
        id: `${id}-checklist-${index}`,
        name: checklistName,
        items: []
      }))
    };

    setStudents((current) => [...current, student]);
    return id;
  }, []);

  const updateStudent = useCallback((studentId: string, draft: NewStudentDraft) => {
    const name = draft.name.trim();
    if (name === '') {
      return;
    }

    setStudents((current) =>
      current.map((student) =>
        student.id !== studentId
          ? student
          : // Initials are derived from the name, so a rename has to re-derive them.
            { ...student, name, instrument: draft.instrument, avatarInitials: initialsFor(name) }
      )
    );
  }, []);

  const deleteStudent = useCallback((studentId: string) => {
    setStudents((current) => current.filter((student) => student.id !== studentId));
  }, []);

  const value = useMemo(
    () => ({ students, setItemStatus, setAttempts, setNotes, addItem, deleteItem, confirmReview, addStudent, updateStudent, deleteStudent }),
    [students, setItemStatus, setAttempts, setNotes, addItem, deleteItem, confirmReview, addStudent, updateStudent, deleteStudent]
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
