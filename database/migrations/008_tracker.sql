CREATE TABLE IF NOT EXISTS tracker_students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  -- The instrument registry lives in the frontend (features/tracker/instruments.ts), which stays
  -- the single place an instrument is added. Storing the name keeps that promise: no enum here to
  -- migrate in lockstep.
  instrument VARCHAR(40) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracker_checklists (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES tracker_students(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracker_items (
  id SERIAL PRIMARY KEY,
  checklist_id INTEGER NOT NULL REFERENCES tracker_checklists(id) ON DELETE CASCADE,
  kind VARCHAR(10) NOT NULL CHECK (kind IN ('skill', 'piece', 'passage')),
  name VARCHAR(200) NOT NULL,
  status VARCHAR(12) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'lacking', 'passed')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Also the review clock: the tracker's "due for review" lens measures staleness from this
  -- column, so every edit and every re-confirmation must move it.
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tracker_students_set_updated_at ON tracker_students;
CREATE TRIGGER tracker_students_set_updated_at BEFORE UPDATE ON tracker_students FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS tracker_checklists_set_updated_at ON tracker_checklists;
CREATE TRIGGER tracker_checklists_set_updated_at BEFORE UPDATE ON tracker_checklists FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS tracker_items_set_updated_at ON tracker_items;
CREATE TRIGGER tracker_items_set_updated_at BEFORE UPDATE ON tracker_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_tracker_checklists_student ON tracker_checklists(student_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_tracker_items_checklist ON tracker_items(checklist_id, id);
