# Database

## Fresh Setup

Create an empty PostgreSQL database, configure `backend/.env`, then run:

```bash
npm run migrate
npm run seed -w backend
```

`database/schema.sql` is a readable snapshot of the current schema. Use migrations for setup and upgrades so `schema_migrations` records the applied state.

## Migration Rules

Migration files live in `database/migrations/` and use a unique three-digit prefix:

```text
001_init.sql
002_search_indexes.sql
003_lineups.sql
004_rename_praise_category.sql
005_song_pins.sql
006_resources.sql
007_resource_images.sql
```

Add new changes as the next numbered SQL file. Never edit a migration after it has been deployed. Make migrations safe to rerun where PostgreSQL supports it.

The runner:

- Loads `DATABASE_URL` from the environment or `backend/.env`.
- Creates `schema_migrations` if needed.
- Rejects duplicate numeric prefixes.
- Uses a PostgreSQL advisory lock to prevent concurrent deployments.
- Applies each pending file in a transaction.

## Production Upgrade

Run migrations after pulling code and before restarting the backend:

```bash
cd /var/www/music_chords
git pull
npm ci
npm run migrate
npm run build
pm2 restart music-chords-api --update-env
curl --fail http://127.0.0.1:5002/api/ready
```

## Restore Verification

Backups are managed outside this repository. Any restored database must be checked before it replaces production:

```bash
npm run migrate
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM songs;"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM resources;"
curl --fail http://127.0.0.1:5002/api/ready
```

The database dump restores pasted-text resources and uploaded-file metadata. PDF and image bytes must also be restored from the configured `RESOURCES_UPLOAD_DIR`.
