import type { Instrument } from './instruments';

export type ItemStatus = 'not_started' | 'lacking' | 'passed';

export type ItemKind = 'skill' | 'piece' | 'passage';

export interface ChecklistItem {
  id: string;
  kind: ItemKind;
  name: string;
  status: ItemStatus;
  attempts: number;
  notes: string;
  updatedAt: string | null;
}

export interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface Student {
  id: string;
  name: string;
  instrument: Instrument;
  avatarInitials: string;
  checklists: Checklist[];
}

export const STATUS_LABELS: Record<ItemStatus, string> = {
  not_started: 'Not Started',
  lacking: 'Lacking',
  passed: 'Passed'
};

export const KIND_LABELS: Record<ItemKind, string> = {
  skill: 'Skill',
  piece: 'Piece',
  passage: 'Passage'
};

/** Every new student starts with these three checklists, empty. */
export const DEFAULT_CHECKLIST_NAMES = ['Music Reading', 'Scales & Technique', 'Repertoire'];

export const ITEM_STATUSES: ItemStatus[] = ['not_started', 'lacking', 'passed'];

export const ITEM_KINDS: ItemKind[] = ['skill', 'piece', 'passage'];

/** Group headings on the student detail table, in display order. */
export const KIND_GROUPS: { kind: ItemKind; title: string; subtitle: string }[] = [
  { kind: 'skill', title: 'Skills', subtitle: 'Fundamental music reading skills' },
  { kind: 'piece', title: 'Pieces', subtitle: 'Short pieces for reading practice' },
  { kind: 'passage', title: 'Passages', subtitle: 'Specific sections to focus on' }
];
