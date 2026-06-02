# Deployment

## Runtime Layout

Recommended VPS layout:

- Repository: `/var/www/music_chords`
- PostgreSQL database: `music_chords_prod`
- PostgreSQL user: `music_chords_app`
- Backend port: `5002`
- PM2 process: `music-chords-api`
- Frontend static files: `/var/www/music_chords/frontend/dist`

## Environment

Create `/var/www/music_chords/backend/.env`:

```env
NODE_ENV=production
PORT=5002
CLIENT_ORIGIN=https://music.example.com
DATABASE_URL=postgresql://music_chords_app:CHANGE_ME@localhost:5432/music_chords_prod
JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=CHANGE_ME
RESOURCES_UPLOAD_DIR=/var/www/music_chords/backend/uploads/resources
```

Create `/var/www/music_chords/frontend/.env.production`:

```env
VITE_API_BASE_URL=https://music.example.com
```

## Deploy

```bash
cd /var/www/music_chords
git pull
npm ci
mkdir -p /var/www/music_chords/backend/uploads/resources
npm run migrate
npm run build
cd backend
pm2 restart music-chords-api --update-env
curl --fail http://127.0.0.1:5002/api/ready
```

Run `pm2 start dist/index.js --name music-chords-api` instead of restart on the first deployment.

## Nginx

Serve `frontend/dist` and proxy `/api/` to `http://127.0.0.1:5002`. Enable TLS before production use.

## Backups

Backup automation is intentionally external to this repository. Verify the Google Drive job includes both the `music_chords_prod` database dump and `/var/www/music_chords/backend/uploads/resources`. Database dumps protect pasted text and file metadata but do not contain uploaded PDF or image bytes. Perform a restore drill before production rollout.
