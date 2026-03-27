CREATE TABLE IF NOT EXISTS lineups (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lineup_songs (
  lineup_id INTEGER NOT NULL REFERENCES lineups(id) ON DELETE CASCADE,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (lineup_id, position),
  UNIQUE (lineup_id, song_id)
);

DROP TRIGGER IF EXISTS lineups_set_updated_at ON lineups;
CREATE TRIGGER lineups_set_updated_at BEFORE UPDATE ON lineups FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_lineup_songs_song_id ON lineup_songs(song_id);
CREATE INDEX IF NOT EXISTS idx_lineup_songs_lineup_id_position ON lineup_songs(lineup_id, position);
CREATE INDEX IF NOT EXISTS idx_lineups_updated_at ON lineups(updated_at DESC);
