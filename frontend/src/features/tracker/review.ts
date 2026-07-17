import type { Checklist, ChecklistItem, ItemKind, Student } from './trackerTypes';

/**
 * How long a passed item stays trusted before the teacher is nudged to re-check it.
 *
 * Rates differ by kind on purpose. Reading skills are reinforced every time the student
 * plays anything, so they rot slowly; a memorised piece or passage goes cold in weeks.
 * A single blanket rate would flag the whole table at once, and a table where everything
 * is flagged gets ignored.
 */
export const REVIEW_THRESHOLD_DAYS: Record<ItemKind, number> = {
  skill: 90,
  piece: 28,
  passage: 28
};

export function daysSince(isoDate: string, now: Date = new Date()): number {
  const elapsed = now.getTime() - new Date(isoDate).getTime();
  return Math.floor(elapsed / (1000 * 60 * 60 * 24));
}

/**
 * Only passed items go stale — "Lacking" and "Not Started" are already on the teacher's
 * radar, and flagging them too would just be noise. This never mutates status: it is a
 * lens over the teacher's verdict, not a replacement for it.
 */
export function isReviewDue(item: ChecklistItem, now: Date = new Date()): boolean {
  if (item.status !== 'passed' || item.updatedAt === null) {
    return false;
  }

  return daysSince(item.updatedAt, now) >= REVIEW_THRESHOLD_DAYS[item.kind];
}

export function checklistReviewDueCount(checklist: Checklist, now: Date = new Date()): number {
  return checklist.items.filter((item) => isReviewDue(item, now)).length;
}

export function studentReviewDueCount(student: Student, now: Date = new Date()): number {
  return student.checklists.reduce((total, checklist) => total + checklistReviewDueCount(checklist, now), 0);
}
