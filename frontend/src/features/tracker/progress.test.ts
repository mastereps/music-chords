import { describe, expect, it } from 'vitest';

import { checklistProgress, studentProgress } from './progress';
import type { Checklist, ChecklistItem, ItemStatus, Student } from './trackerTypes';

function item(id: string, status: ItemStatus): ChecklistItem {
  return { id, kind: 'skill', name: `Item ${id}`, status, attempts: 0, notes: '', updatedAt: null };
}

function checklist(id: string, statuses: ItemStatus[]): Checklist {
  return { id, name: `Checklist ${id}`, items: statuses.map((status, index) => item(`${id}-${index}`, status)) };
}

function student(checklists: Checklist[]): Student {
  return { id: 's1', name: 'Test Student', instrument: 'Piano', avatarInitials: 'TS', checklists };
}

describe('checklistProgress', () => {
  it('returns 0 for an empty checklist instead of dividing by zero', () => {
    expect(checklistProgress(checklist('c1', []))).toBe(0);
  });

  it('returns 100 when every item passed', () => {
    expect(checklistProgress(checklist('c1', ['passed', 'passed']))).toBe(100);
  });

  it('counts only passed items, not lacking or not started', () => {
    expect(checklistProgress(checklist('c1', ['passed', 'lacking', 'not_started', 'passed']))).toBe(50);
  });

  it('rounds to the nearest whole percent', () => {
    expect(checklistProgress(checklist('c1', ['passed', 'lacking', 'lacking']))).toBe(33);
  });
});

describe('studentProgress', () => {
  it('returns 0 when the student has no items at all', () => {
    expect(studentProgress(student([checklist('c1', [])]))).toBe(0);
  });

  it('pools items across checklists rather than averaging the checklists', () => {
    // 1 of 1 passed in c1, 1 of 3 passed in c2 => 2 of 4 overall (50%), not the 67% an average would give.
    const subject = student([checklist('c1', ['passed']), checklist('c2', ['passed', 'lacking', 'not_started'])]);

    expect(studentProgress(subject)).toBe(50);
  });
});
