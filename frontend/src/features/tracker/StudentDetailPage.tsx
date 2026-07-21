import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ChecklistRow } from './components/ChecklistRow';
import { GroupHeader } from './components/GroupHeader';
import { ProgressBar } from './components/ProgressBar';
import { ROW_GRID } from './components/rowGrid';
import { StudentAvatar } from './components/StudentAvatar';
import { AddItemModal } from './components/AddItemModal';
import { StudentActionsMenu } from './components/StudentActionsMenu';
import { StudentFormModal } from './components/StudentFormModal';
import { instrumentStyle } from './instruments';
import { studentProgress } from './progress';
import { studentReviewDueCount } from './review';
import { useTracker } from './TrackerProvider';
import { KIND_GROUPS } from './trackerTypes';
import { DeleteModal } from '../../components/DeleteModal';

export function StudentDetailPage() {
  const { studentId } = useParams();
  const { students, setItemStatus, setAttempts, setNotes, addItem, deleteItem, confirmReview, updateStudent, deleteStudent, canEdit, isLoading } =
    useTracker();
  const navigate = useNavigate();
  const [activeChecklistId, setActiveChecklistId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);

  const student = students.find((candidate) => candidate.id === studentId);

  if (isLoading) {
    return <p className="mx-auto max-w-6xl text-sm text-studio-muted">Loading student…</p>;
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-6xl">
        <p className="text-studio-ink">That student could not be found.</p>
        <Link to="/tracker" className="mt-2 inline-block text-sm font-semibold text-studio-accent">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const checklist = student.checklists.find((candidate) => candidate.id === activeChecklistId) ?? student.checklists[0];
  const style = instrumentStyle(student.instrument);
  const overall = studentProgress(student);
  const reviewDue = studentReviewDueCount(student);
  const totalItems = student.checklists.reduce((count, list) => count + list.items.length, 0);
  const pendingDeleteItem = checklist.items.find((item) => item.id === pendingDeleteId) ?? null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/tracker" className="text-sm font-semibold text-studio-accent transition hover:opacity-80">
          ← Back to Dashboard
        </Link>
        {canEdit ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 rounded-full bg-studio-accent px-4 py-2.5 text-sm font-semibold text-white shadow-panel transition hover:bg-studio-accent/90"
            >
              <span aria-hidden="true">+</span> Add Item
            </button>
            <StudentActionsMenu
              studentName={student.name}
              onEdit={() => setIsEditingStudent(true)}
              onDelete={() => setIsDeletingStudent(true)}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <StudentAvatar initials={student.avatarInitials} instrument={student.instrument} size="sm" />
          <div>
            <h1 className="font-display text-2xl font-bold text-studio-ink sm:text-3xl">{student.name}</h1>
            <p className="text-sm font-medium" style={{ color: style.color }}>
              {student.instrument}
            </p>
          </div>
        </div>

        <div className="flex min-w-[240px] flex-1 items-center gap-4 sm:max-w-sm">
          <p className="font-display text-3xl font-bold" style={{ color: style.color }}>
            {overall}
            <span className="text-lg">%</span>
          </p>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-studio-muted">Overall Progress</p>
            <ProgressBar value={overall} color={style.color} className="mt-1.5" />
            {reviewDue > 0 ? (
              <p className="mt-1.5 text-xs font-semibold text-status-lacking">
                ↻ {reviewDue} due for review
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-studio-line">
        {student.checklists.map((candidate) => {
          const isActive = candidate.id === checklist.id;
          return (
            <button
              key={candidate.id}
              type="button"
              aria-current={isActive ? 'true' : undefined}
              onClick={() => {
                setActiveChecklistId(candidate.id);
                setPendingDeleteId(null);
              }}
              className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                isActive ? 'border-studio-accent text-studio-accent' : 'border-transparent text-studio-muted hover:text-studio-ink'
              }`}
            >
              {candidate.name}
            </button>
          );
        })}
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border border-studio-line bg-studio-card shadow-panel">
        <div
          className={`hidden gap-x-4 border-b border-studio-line bg-studio-page/70 px-4 py-2.5 text-xs font-semibold text-studio-muted md:grid ${ROW_GRID}`}
        >
          <span>Item</span>
          <span>Status</span>
          <span>Attempts</span>
          <span>Notes</span>
          <span>Last Updated</span>
          <span className="sr-only">Actions</span>
        </div>

        {checklist.items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-studio-muted">
            {canEdit ? 'Nothing on this checklist yet. Use “Add Item” to start tracking.' : 'Nothing on this checklist yet.'}
          </p>
        ) : (
          KIND_GROUPS.map((group) => {
            const items = checklist.items.filter((item) => item.kind === group.kind);
            if (items.length === 0) {
              return null;
            }

            return (
              <div key={group.kind}>
                <GroupHeader kind={group.kind} title={group.title} subtitle={group.subtitle} />
                {items.map((item) => (
                  <ChecklistRow
                    key={item.id}
                    item={item}
                    onStatusChange={(status) => setItemStatus(student.id, checklist.id, item.id, status)}
                    onAttemptsChange={(attempts) => setAttempts(student.id, checklist.id, item.id, attempts)}
                    onNotesChange={(notes) => setNotes(student.id, checklist.id, item.id, notes)}
                    onDelete={() => setPendingDeleteId(item.id)}
                    onConfirmReview={() => confirmReview(student.id, checklist.id, item.id)}
                    readOnly={!canEdit}
                  />
                ))}
              </div>
            );
          })
        )}
      </section>

      <AddItemModal
        isOpen={isAddOpen}
        checklistName={checklist.name}
        onAdd={(draft) => {
          addItem(student.id, checklist.id, draft);
          setIsAddOpen(false);
        }}
        onCancel={() => setIsAddOpen(false)}
      />

      <DeleteModal
        isOpen={pendingDeleteItem !== null}
        title="Delete this item?"
        message={
          pendingDeleteItem
            ? `“${pendingDeleteItem.name}” will be removed from ${checklist.name}. This action cannot be undone.`
            : ''
        }
        onConfirm={async () => {
          if (pendingDeleteItem) {
            deleteItem(student.id, checklist.id, pendingDeleteItem.id);
          }
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />

      {isEditingStudent ? (
        <StudentFormModal
          mode="edit"
          initialName={student.name}
          initialInstrument={student.instrument}
          onSubmit={(draft) => {
            updateStudent(student.id, draft);
            setIsEditingStudent(false);
          }}
          onCancel={() => setIsEditingStudent(false)}
        />
      ) : null}

      <DeleteModal
        isOpen={isDeletingStudent}
        title={`Delete ${student.name}?`}
        message={`This removes ${student.name} and all ${totalItems} ${totalItems === 1 ? 'item' : 'items'} across their ${student.checklists.length} checklists, including every note and attempt. This action cannot be undone.`}
        onConfirm={async () => {
          setIsDeletingStudent(false);
          deleteStudent(student.id);
          navigate('/tracker');
        }}
        onCancel={() => setIsDeletingStudent(false)}
      />
    </div>
  );
}
