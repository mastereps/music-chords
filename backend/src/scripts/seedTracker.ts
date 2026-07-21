import { pool, query } from '../config/db';
import { logger } from '../config/logger';
import { trackerSeedStudents } from './trackerSeedData';

/**
 * Only ever runs against an empty tracker. Re-seeding a live roster would duplicate students or
 * quietly overwrite a teacher's real notes, so a single existing row means "hands off".
 */
export async function seedTracker() {
  const existing = await query<{ count: string }>('SELECT COUNT(*)::text AS count FROM tracker_students');

  if (Number(existing.rows[0].count) > 0) {
    logger.info('Tracker already has students, skipping tracker seed');
    return;
  }

  for (const student of trackerSeedStudents) {
    const studentResult = await query<{ id: number }>(
      'INSERT INTO tracker_students (name, instrument) VALUES ($1, $2) RETURNING id',
      [student.name, student.instrument]
    );
    const studentId = studentResult.rows[0].id;

    for (const [index, checklist] of student.checklists.entries()) {
      const checklistResult = await query<{ id: number }>(
        'INSERT INTO tracker_checklists (student_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id',
        [studentId, checklist.name, index]
      );
      const checklistId = checklistResult.rows[0].id;

      for (const item of checklist.items) {
        await query(
          `INSERT INTO tracker_items (checklist_id, kind, name, status, attempts, notes, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW() - ($7 || ' days')::INTERVAL)`,
          [checklistId, item.kind, item.name, item.status, item.attempts, item.notes, String(item.daysAgo)]
        );
      }
    }
  }

  logger.info('Tracker seeded', { students: trackerSeedStudents.length });
}

// Runnable on its own (`npm run seed:tracker -w backend`) so filling an empty tracker never has to
// re-run the user and song seed alongside it.
if (process.argv[1]?.includes('seedTracker')) {
  seedTracker()
    .catch((error) => {
      logger.error('Tracker seed failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      process.exitCode = 1;
    })
    .finally(async () => {
      await pool.end();
    });
}
