INSERT INTO roles (name)
VALUES ('admin'), ('editor'), ('viewer')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, slug, sort_order)
VALUES
  ('Praise', 'praise', 1),
  ('Worship', 'worship', 2),
  ('Old Songs', 'old-songs', 3),
  ('Christmas', 'christmas', 4),
  ('Youth', 'youth', 5),
  ('Special Number', 'special-number', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tags (name, slug)
VALUES
  ('Communion', 'communion'),
  ('Opening', 'opening'),
  ('Prayer', 'prayer'),
  ('Fast', 'fast'),
  ('Reflection', 'reflection')
ON CONFLICT (slug) DO NOTHING;
