CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  kind VARCHAR(10) NOT NULL CHECK (kind IN ('pdf', 'text')),
  body_text TEXT,
  stored_filename VARCHAR(255),
  original_filename VARCHAR(255),
  mime_type VARCHAR(100),
  byte_size INTEGER CHECK (byte_size IS NULL OR byte_size >= 0),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (kind = 'text' AND body_text IS NOT NULL AND stored_filename IS NULL)
    OR
    (kind = 'pdf' AND body_text IS NULL AND stored_filename IS NOT NULL)
  )
);

DROP TRIGGER IF EXISTS resources_set_updated_at ON resources;
CREATE TRIGGER resources_set_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_resources_updated_at ON resources(updated_at DESC);
