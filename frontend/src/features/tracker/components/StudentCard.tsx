import { Link } from 'react-router-dom';

import { ProgressBar } from './ProgressBar';
import { StudentAvatar } from './StudentAvatar';
import { instrumentStyle } from '../instruments';
import { checklistProgress, studentProgress } from '../progress';
import { checklistReviewDueCount, studentReviewDueCount } from '../review';
import type { Student } from '../trackerTypes';

const CHECKLIST_ICONS: Record<string, string> = {
  'Music Reading': '📖',
  'Scales & Technique': '🎼',
  Repertoire: '🎵'
};

export function StudentCard({ student }: { student: Student }) {
  const style = instrumentStyle(student.instrument);
  const overall = studentProgress(student);
  const reviewDue = studentReviewDueCount(student);

  return (
    <article className="flex flex-col rounded-2xl border border-studio-line bg-studio-card p-6 shadow-panel">
      <div className="flex flex-col items-center text-center">
        <StudentAvatar initials={student.avatarInitials} instrument={student.instrument} />
        <h2 className="mt-4 font-display text-xl font-semibold text-studio-ink">{student.name}</h2>
        <p className="text-sm font-medium" style={{ color: style.color }}>
          {student.instrument}
        </p>
      </div>

      <div className="mt-5 flex items-baseline justify-between">
        <p className="font-display text-4xl font-bold" style={{ color: style.color }}>
          {overall}
          <span className="text-xl">%</span>
        </p>
        <p className="text-sm text-studio-muted">Complete</p>
      </div>
      <ProgressBar value={overall} color={style.color} className="mt-2" />
      {reviewDue > 0 ? (
        <p className="mt-2 text-xs font-semibold text-status-lacking">↻ {reviewDue} due for review</p>
      ) : null}

      <dl className="mt-5 space-y-3 border-t border-studio-line pt-4">
        {student.checklists.map((checklist) => {
          const checklistDue = checklistReviewDueCount(checklist);

          return (
            <div key={checklist.id} className="flex items-center justify-between gap-3">
              <dt className="flex min-w-0 items-center gap-2 text-sm text-studio-ink">
                <span aria-hidden="true" className="text-base">
                  {CHECKLIST_ICONS[checklist.name] ?? '🎵'}
                </span>
                <span className="truncate">{checklist.name}</span>
                {checklistDue > 0 ? (
                  <span title={`${checklistDue} due for review`} aria-label={`${checklistDue} due for review`} className="shrink-0 text-status-lacking">
                    ↻
                  </span>
                ) : null}
              </dt>
              <dd className="shrink-0 text-sm font-semibold tabular-nums text-studio-ink">{checklistProgress(checklist)}%</dd>
            </div>
          );
        })}
      </dl>

      <Link
        to={`/tracker/students/${student.id}`}
        style={{ color: style.color }}
        className="mt-5 flex items-center justify-center gap-2 border-t border-studio-line pt-4 text-sm font-semibold transition hover:gap-3"
      >
        View Progress <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
