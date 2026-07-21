import type {
  TrackerChecklist,
  TrackerItem,
  TrackerItemInput,
  TrackerItemPatch,
  TrackerStudent,
  TrackerStudentInput
} from '@music-chords/shared';

import { pool, query } from '../../config/db';
import { assertFound } from '../../utils/http';

/** Every new student starts with these three checklists, empty. Mirrors DEFAULT_CHECKLIST_NAMES on the frontend. */
const DEFAULT_CHECKLIST_NAMES = ['Music Reading', 'Scales & Technique', 'Repertoire'];

interface StudentRow {
  id: number;
  name: string;
  instrument: string;
}

interface ChecklistRow {
  id: number;
  student_id: number;
  name: string;
}

interface ItemRow {
  id: number;
  checklist_id: number;
  kind: TrackerItem['kind'];
  name: string;
  status: TrackerItem['status'];
  attempts: number;
  notes: string;
  updated_at: Date;
}

function mapItem(row: ItemRow): TrackerItem {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    status: row.status,
    attempts: Number(row.attempts),
    notes: row.notes,
    updatedAt: row.updated_at.toISOString()
  };
}

/**
 * Loads every student with their checklists and items in three flat queries, then stitches
 * them together. Three queries regardless of roster size beats a join per student.
 */
export async function listStudents(): Promise<TrackerStudent[]> {
  const [students, checklists, items] = await Promise.all([
    query<StudentRow>('SELECT id, name, instrument FROM tracker_students ORDER BY id'),
    query<ChecklistRow>('SELECT id, student_id, name FROM tracker_checklists ORDER BY student_id, sort_order, id'),
    query<ItemRow>(
      'SELECT id, checklist_id, kind, name, status, attempts, notes, updated_at FROM tracker_items ORDER BY checklist_id, id'
    )
  ]);

  const itemsByChecklist = new Map<number, TrackerItem[]>();
  for (const row of items.rows) {
    const bucket = itemsByChecklist.get(row.checklist_id) ?? [];
    bucket.push(mapItem(row));
    itemsByChecklist.set(row.checklist_id, bucket);
  }

  const checklistsByStudent = new Map<number, TrackerChecklist[]>();
  for (const row of checklists.rows) {
    const bucket = checklistsByStudent.get(row.student_id) ?? [];
    bucket.push({ id: row.id, name: row.name, items: itemsByChecklist.get(row.id) ?? [] });
    checklistsByStudent.set(row.student_id, bucket);
  }

  return students.rows.map((row) => ({
    id: row.id,
    name: row.name,
    instrument: row.instrument,
    checklists: checklistsByStudent.get(row.id) ?? []
  }));
}

export async function createStudent(input: TrackerStudentInput): Promise<TrackerStudent> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const studentResult = await client.query<StudentRow>(
      'INSERT INTO tracker_students (name, instrument) VALUES ($1, $2) RETURNING id, name, instrument',
      [input.name, input.instrument]
    );
    const student = studentResult.rows[0];

    const checklists: TrackerChecklist[] = [];
    for (const [index, name] of DEFAULT_CHECKLIST_NAMES.entries()) {
      const checklistResult = await client.query<ChecklistRow>(
        'INSERT INTO tracker_checklists (student_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id, student_id, name',
        [student.id, name, index]
      );
      checklists.push({ id: checklistResult.rows[0].id, name: checklistResult.rows[0].name, items: [] });
    }

    await client.query('COMMIT');

    return { id: student.id, name: student.name, instrument: student.instrument, checklists };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/** Renames a student or changes their instrument. Checklists are left untouched. */
export async function updateStudent(id: number, input: TrackerStudentInput): Promise<TrackerStudent> {
  const result = await query<StudentRow>(
    'UPDATE tracker_students SET name = $2, instrument = $3 WHERE id = $1 RETURNING id, name, instrument',
    [id, input.name, input.instrument]
  );
  const row = assertFound(result.rows[0], 'Student not found');

  const checklists = await query<ChecklistRow>(
    'SELECT id, student_id, name FROM tracker_checklists WHERE student_id = $1 ORDER BY sort_order, id',
    [id]
  );
  const items = await query<ItemRow>(
    `SELECT i.id, i.checklist_id, i.kind, i.name, i.status, i.attempts, i.notes, i.updated_at
     FROM tracker_items i
     INNER JOIN tracker_checklists c ON c.id = i.checklist_id
     WHERE c.student_id = $1
     ORDER BY i.checklist_id, i.id`,
    [id]
  );

  return {
    id: row.id,
    name: row.name,
    instrument: row.instrument,
    checklists: checklists.rows.map((checklist) => ({
      id: checklist.id,
      name: checklist.name,
      items: items.rows.filter((item) => item.checklist_id === checklist.id).map(mapItem)
    }))
  };
}

/** Removes a student; checklists and items go with them via ON DELETE CASCADE. */
export async function deleteStudent(id: number): Promise<void> {
  const result = await query<{ id: number }>('DELETE FROM tracker_students WHERE id = $1 RETURNING id', [id]);
  assertFound(result.rows[0], 'Student not found');
}

export async function createItem(checklistId: number, input: TrackerItemInput): Promise<TrackerItem> {
  const checklist = await query<{ id: number }>('SELECT id FROM tracker_checklists WHERE id = $1', [checklistId]);
  assertFound(checklist.rows[0], 'Checklist not found');

  const result = await query<ItemRow>(
    `INSERT INTO tracker_items (checklist_id, kind, name, status, attempts, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, checklist_id, kind, name, status, attempts, notes, updated_at`,
    [checklistId, input.kind, input.name, input.status, input.attempts, input.notes]
  );

  return mapItem(result.rows[0]);
}

/**
 * Applies a partial change to one item. `updated_at` is always re-stamped, including for an
 * empty patch — that is exactly what re-confirming a stale "passed" item does.
 */
export async function updateItem(id: number, patch: TrackerItemPatch): Promise<TrackerItem> {
  const result = await query<ItemRow>(
    `UPDATE tracker_items
     SET name = COALESCE($2, name),
         status = COALESCE($3, status),
         attempts = COALESCE($4, attempts),
         notes = COALESCE($5, notes),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, checklist_id, kind, name, status, attempts, notes, updated_at`,
    [id, patch.name ?? null, patch.status ?? null, patch.attempts ?? null, patch.notes ?? null]
  );

  return mapItem(assertFound(result.rows[0], 'Checklist item not found'));
}

export async function deleteItem(id: number): Promise<void> {
  const result = await query<{ id: number }>('DELETE FROM tracker_items WHERE id = $1 RETURNING id', [id]);
  assertFound(result.rows[0], 'Checklist item not found');
}
