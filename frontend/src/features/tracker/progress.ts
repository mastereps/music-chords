import type { Checklist, ChecklistItem, Student } from './trackerTypes';

function percentPassed(items: ChecklistItem[]): number {
  if (items.length === 0) {
    return 0;
  }

  const passed = items.filter((item) => item.status === 'passed').length;
  return Math.round((passed / items.length) * 100);
}

/** Percent of a single checklist's items that have passed. */
export function checklistProgress(checklist: Checklist): number {
  return percentPassed(checklist.items);
}

/** Percent passed across every item the student has, in all checklists. */
export function studentProgress(student: Student): number {
  return percentPassed(student.checklists.flatMap((checklist) => checklist.items));
}
