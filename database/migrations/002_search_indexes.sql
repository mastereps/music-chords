CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_songs_search_vector ON songs USING GIN (
  (
    setweight(to_tsvector('simple', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(artist, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(content, '')), 'C')
  )
);
