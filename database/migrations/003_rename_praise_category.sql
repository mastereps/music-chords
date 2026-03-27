UPDATE categories
SET name = 'Praising',
    slug = 'praising',
    sort_order = 1,
    updated_at = NOW()
WHERE slug = 'praise'
  AND NOT EXISTS (SELECT 1 FROM categories existing WHERE existing.slug = 'praising');

UPDATE categories
SET name = 'Praising',
    sort_order = 1,
    updated_at = NOW()
WHERE slug = 'praising';
