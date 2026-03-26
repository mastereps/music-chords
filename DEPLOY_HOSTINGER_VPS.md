# Deploy Music Chords To Existing Hostinger VPS

This app can live on the same VPS as your existing `webinar` app if you keep these separate:

- Repo folder: `/var/www/music_chords`
- PostgreSQL database: `music_chords_prod`
- PostgreSQL user: `music_chords_app`
- Backend port: `5002`
- PM2 process: `music-chords-api`
- Nginx site file: `/etc/nginx/sites-available/music-chords`
- Domain: replace `music.yourdomain.com` with your real Music Chords domain

Your existing webinar app can stay exactly where it is.

## 1. VPS Base Setup

If Node, Nginx, PostgreSQL, and PM2 are already installed for the webinar app, you usually only need to update packages.

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

## 2. Clone Music Chords Into A Different Folder

```bash
sudo mkdir -p /var/www/music_chords
sudo chown -R $USER:$USER /var/www/music_chords
git clone https://github.com/YOUR_GITHUB_USER/YOUR_MUSIC_CHORDS_REPO /var/www/music_chords
```

If the repo already exists and you are updating:

```bash
cd /var/www/music_chords
git pull
```

## 3. Create A Separate PostgreSQL Database And User

```bash
sudo -u postgres psql
```

Run:

```sql
CREATE DATABASE music_chords_prod;
CREATE USER music_chords_app WITH PASSWORD 'CHANGE_THIS_PASSWORD';
ALTER DATABASE music_chords_prod OWNER TO music_chords_app;
GRANT ALL PRIVILEGES ON DATABASE music_chords_prod TO music_chords_app;
\q
```

## 4. Upload Your Existing PostgreSQL Dump

You mentioned the dump file is:

- `D:\postgresql_dump\msc_v1.sql`

From your Windows machine:

```powershell
scp D:\postgresql_dump\msc_v1.sql mastereps@YOUR_VPS_IP:/var/www/music_chords/database/
```

On the VPS, restore it:

```bash
sudo -u postgres psql -d music_chords_prod -f /var/www/music_chords/database/msc_v1.sql
```

Then fix ownership and privileges for the app user:

```bash
sudo -u postgres psql -d music_chords_prod
```

```sql
ALTER DATABASE music_chords_prod OWNER TO music_chords_app;
GRANT CONNECT, TEMP ON DATABASE music_chords_prod TO music_chords_app;
GRANT USAGE, CREATE ON SCHEMA public TO music_chords_app;
ALTER SCHEMA public OWNER TO music_chords_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO music_chords_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO music_chords_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO music_chords_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO music_chords_app;
\q
```

Verify:

```bash
psql "postgresql://music_chords_app:CHANGE_THIS_PASSWORD@localhost:5432/music_chords_prod" -c "\dt+"
```

## 5. If You Do Not Want To Restore `msc_v1.sql`

Use the project schema and seed instead:

```bash
cd /var/www/music_chords
npm ci
psql "postgresql://music_chords_app:CHANGE_THIS_PASSWORD@localhost:5432/music_chords_prod" -f database/schema.sql
npm run seed -w backend
```

Do this only if you want a fresh database instead of the dump.

## 6. Install Dependencies And Build

This project is a monorepo. Run install and build from the repo root:

```bash
cd /var/www/music_chords
npm ci
npm run build
```

## 7. Backend Environment

Create:

- `/var/www/music_chords/backend/.env`

Content:

```env
NODE_ENV=production
PORT=5002
CLIENT_ORIGIN=https://music.yourdomain.com
DATABASE_URL=postgresql://music_chords_app:CHANGE_THIS_PASSWORD@localhost:5432/music_chords_prod
JWT_SECRET=PUT_A_LONG_RANDOM_SECRET_HERE
JWT_EXPIRES_IN=7d
SEED_ADMIN_EMAIL=master@master.io
SEED_ADMIN_PASSWORD=CHANGE_THIS_ADMIN_PASSWORD
```

Notes:

- `CLIENT_ORIGIN` must match the frontend domain exactly.
- This backend expects a single `CLIENT_ORIGIN`, not a comma-separated list.
- `JWT_SECRET` should be long and random.

## 8. Frontend Environment

Create:

- `/var/www/music_chords/frontend/.env.production`

Content:

```env
VITE_API_BASE_URL=https://music.yourdomain.com
```

Then rebuild so Vite picks up the production env:

```bash
cd /var/www/music_chords
npm run build
```

## 9. Start Backend With PM2

Start the backend from the `backend` folder so it reads `backend/.env` correctly.

```bash
cd /var/www/music_chords/backend
pm2 start dist/index.js --name music-chords-api
pm2 save
```

If PM2 startup is not yet enabled for your VPS user:

```bash
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u mastereps --hp /home/mastereps
pm2 save
systemctl status pm2-mastereps
```

Useful PM2 commands:

```bash
pm2 restart music-chords-api --update-env
pm2 logs music-chords-api --lines 50
pm2 status
```

## 10. Nginx Site For Music Chords

Create:

- `/etc/nginx/sites-available/music-chords`

Example config:

```nginx
server {
  listen 80;
  server_name music.yourdomain.com www.music.yourdomain.com;

  root /var/www/music_chords/frontend/dist;
  index index.html;

  location / {
    try_files $uri /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:5002;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/music-chords /etc/nginx/sites-enabled/music-chords
sudo nginx -t
sudo systemctl reload nginx
```

If you want SSL:

```bash
sudo certbot --nginx -d music.yourdomain.com -d www.music.yourdomain.com
```

## 11. Health Check

Test backend directly on the VPS:

```bash
curl http://127.0.0.1:5002/api/health
```

Expected response:

```json
{"status":"ok"}
```

## 12. Update Workflow Later

When you push new changes:

```bash
cd /var/www/music_chords
git pull
npm ci
npm run build
pm2 restart music-chords-api --update-env
```

## 13. Separate App Summary

Your webinar app:

- Folder: `/var/www/react_webinar`
- Database: `fullstack_test`
- Port: `5001`
- PM2: `webinar-api`

Your music chords app:

- Folder: `/var/www/music_chords`
- Database: `music_chords_prod`
- Port: `5002`
- PM2: `music-chords-api`

They can run together on the same VPS without conflict as long as you keep those values separate.

## 14. Recommended Order

1. Clone repo into `/var/www/music_chords`
2. Create `music_chords_prod` and `music_chords_app`
3. Upload and restore `msc_v1.sql`
4. Fix DB ownership and grants
5. Create `backend/.env`
6. Create `frontend/.env.production`
7. Run `npm ci`
8. Run `npm run build`
9. Start PM2 backend
10. Add Nginx site
11. Enable SSL
12. Open the site and test login
