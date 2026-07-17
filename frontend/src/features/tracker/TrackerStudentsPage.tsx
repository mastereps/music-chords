import { StudentCard } from './components/StudentCard';
import { useTracker } from './TrackerProvider';

export function TrackerStudentsPage() {
  const { students } = useTracker();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-bold text-studio-ink sm:text-4xl">Students</h1>
      <p className="mt-1 text-sm text-studio-muted">
        {students.length} students enrolled. Open a student to update their checklists.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {students.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    </div>
  );
}
