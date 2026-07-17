import { describe, expect, it } from 'vitest';

import { REVIEW_THRESHOLD_DAYS, checklistReviewDueCount, daysSince, isReviewDue, studentReviewDueCount } from './review';
import type { ChecklistItem, ItemKind, ItemStatus, Student } from './trackerTypes';

const NOW = new Date('2026-07-17T12:00:00');

function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

function item(kind: ItemKind, status: ItemStatus, updatedAt: string | null): ChecklistItem {
  return { id: 'i1', kind, name: 'Item', status, attempts: 1, notes: '', updatedAt };
}

describe('daysSince', () => {
  it('counts whole elapsed days', () => {
    expect(daysSince(daysAgo(30), NOW)).toBe(30);
  });
});

describe('isReviewDue', () => {
  it('flags a passed piece once it is past its threshold', () => {
    expect(isReviewDue(item('piece', 'passed', daysAgo(REVIEW_THRESHOLD_DAYS.piece + 1)), NOW)).toBe(true);
  });

  it('leaves a recently passed piece alone', () => {
    expect(isReviewDue(item('piece', 'passed', daysAgo(3)), NOW)).toBe(false);
  });

  it('flags exactly on the threshold day', () => {
    expect(isReviewDue(item('piece', 'passed', daysAgo(REVIEW_THRESHOLD_DAYS.piece)), NOW)).toBe(true);
  });

  it('lets skills rot more slowly than pieces', () => {
    const age = daysAgo(REVIEW_THRESHOLD_DAYS.piece + 1);

    expect(isReviewDue(item('piece', 'passed', age), NOW)).toBe(true);
    expect(isReviewDue(item('skill', 'passed', age), NOW)).toBe(false);
  });

  it('never flags items the teacher has not passed', () => {
    const stale = daysAgo(400);

    expect(isReviewDue(item('piece', 'lacking', stale), NOW)).toBe(false);
    expect(isReviewDue(item('piece', 'not_started', stale), NOW)).toBe(false);
  });

  it('never flags an item with no recorded date', () => {
    expect(isReviewDue(item('piece', 'passed', null), NOW)).toBe(false);
  });
});

describe('review counts', () => {
  const fresh = item('piece', 'passed', daysAgo(2));
  const stale = item('piece', 'passed', daysAgo(200));
  const lacking = item('piece', 'lacking', daysAgo(200));

  it('counts only the due items in a checklist', () => {
    expect(checklistReviewDueCount({ id: 'c', name: 'C', items: [fresh, stale, stale, lacking] }, NOW)).toBe(2);
  });

  it('totals due items across a student’s checklists', () => {
    const student: Student = {
      id: 's',
      name: 'Test',
      instrument: 'Piano',
      avatarInitials: 'T',
      checklists: [
        { id: 'c1', name: 'One', items: [stale, fresh] },
        { id: 'c2', name: 'Two', items: [stale] }
      ]
    };

    expect(studentReviewDueCount(student, NOW)).toBe(2);
  });
});
