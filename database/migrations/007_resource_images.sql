ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_kind_check;
ALTER TABLE resources
  ADD CONSTRAINT resources_kind_check CHECK (kind IN ('pdf', 'text', 'image'));

ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_check;
ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_content_check;
ALTER TABLE resources
  ADD CONSTRAINT resources_content_check CHECK (
    (kind = 'text' AND body_text IS NOT NULL AND stored_filename IS NULL)
    OR
    (kind IN ('pdf', 'image') AND body_text IS NULL AND stored_filename IS NOT NULL)
  );
