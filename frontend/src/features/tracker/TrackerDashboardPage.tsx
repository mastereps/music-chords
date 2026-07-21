import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { StudentCard } from './components/StudentCard';
import { StudentFormModal } from './components/StudentFormModal';
import { useTracker } from './TrackerProvider';

/** Decorative staff-and-notes flourish behind the page header. */
function StaffFlourish() {
  return (
    <svg viewBox="0 0 260 70" aria-hidden="true" className="hidden h-16 w-64 shrink-0 md:block">
      <g stroke="#D9CDB0" strokeWidth="1.3" fill="none">
        <path d="M4 20c40-12 80 8 124-4s90 6 128-6" />
        <path d="M4 32c40-12 80 8 124-4s90 6 128-6" />
        <path d="M4 44c40-12 80 8 124-4s90 6 128-6" />
      </g>
      <g fill="#C9B892">
        <circle cx="70" cy="30" r="4.5" />
        <rect x="73.4" y="12" width="1.6" height="19" />
        <circle cx="150" cy="24" r="4.5" />
        <rect x="153.4" y="6" width="1.6" height="19" />
        <path d="M153.4 6c7-1 12 2 14 6-4-2-9-2-14 0z" />
        <circle cx="214" cy="20" r="4.5" />
        <rect x="217.4" y="2" width="1.6" height="19" />
      </g>
    </svg>
  );
}

export function TrackerDashboardPage() {
  const { students, addStudent, canEdit, isLoading } = useTracker();
  const navigate = useNavigate();
  const [isAddOpen, setIsAddOpen] = useState(false);

  if (isLoading) {
    return <p className="mx-auto max-w-6xl text-sm text-studio-muted">Loading students…</p>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-studio-ink sm:text-4xl">Dashboard</h1>
          <p className="mt-1 text-sm text-studio-muted">Overview of all students and their progress.</p>
        </div>
        <div className="flex items-center gap-4">
          <StaffFlourish />
          {canEdit ? (
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 rounded-full bg-studio-gold px-4 py-2.5 text-sm font-semibold text-white shadow-panel transition hover:bg-studio-gold/90"
            >
              <span aria-hidden="true">+</span> Add Student
            </button>
          ) : null}
        </div>
      </div>

      {students.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-studio-line bg-studio-card px-4 py-10 text-center text-sm text-studio-muted">
          {canEdit ? 'No students yet. Use “Add Student” to enroll the first one.' : 'No students enrolled yet.'}
        </p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}

      {isAddOpen ? (
        <StudentFormModal
          mode="add"
          onSubmit={async (draft) => {
            const id = await addStudent(draft);
            setIsAddOpen(false);
            if (id) {
              navigate(`/tracker/students/${id}`);
            }
          }}
          onCancel={() => setIsAddOpen(false)}
        />
      ) : null}
    </div>
  );
}
