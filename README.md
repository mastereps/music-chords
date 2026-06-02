# Music Chords

Mobile-first web app for viewing, searching, transposing, and managing chord sheets. The product is intentionally chords-only: no playback, no streaming, and no audio features.

## Stack

- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL with pooling via `pg`
- Validation: Zod
- Auth: cookie-based JWT session
- Tests: Vitest for transpose utilities and API validation

## Workspace Layout

- `frontend/` React app, mobile-first pages, reusable components
- `backend/` Express REST API, validation, auth, PostgreSQL data access
- `shared/` shared TypeScript types and transpose utilities
- `database/` schema, migration SQL, and seed SQL
- `docs/` tracked architecture, API, database, testing, and deployment guides

## Core Features

- Fast mobile song search by title, artist, category, tag, and language with sticky search bar and overflow-safe song cards
- Clean chord sheet viewer with monospaced formatting
- Chord transposition up/down with sharps/flats support
- Font size controls and a dark mode toggle with dark as the default first-load theme
- Admin/editor authentication and role-based access
- CRUD for songs and categories
- Suggest correction flow for non-editors
- Revision history tracking for edits
- Draft vs published song status
- Category and tag filtering
- Public document library for PDF viewing, image viewing, and printable pasted-text notes
- Admin-only resource upload and deletion

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm 10+

## Setup

1. Install dependencies:
   `npm install`
2. Copy env files and adjust values:
   - `copy frontend\.env.example frontend\.env`
   - `copy backend\.env.example backend\.env`
3. Update `backend/.env` with your real PostgreSQL password in `DATABASE_URL` and set a long `JWT_SECRET`.
4. Create the database:
   `createdb music_chords`
5. Apply all pending database migrations:
   `npm run migrate`
6. Seed admin user and sample songs:
   `npm run seed -w backend`
7. Start the apps in separate terminals:
   - `npm run dev:backend`
   - `npm run dev:frontend`

If `npm run seed -w backend` fails with missing `DATABASE_URL` or `JWT_SECRET`, your `backend/.env` is missing or incomplete.

Default seeded admin credentials:

- Email: `admin@example.com`
- Password: `Admin123!`

## Build and Test

- Build all packages: `npm run build`
- Run unit, schema, and frontend component tests: `npm run test`
- Backend only: `npm run test -w backend`
- Shared transpose tests only: `npm run test -w shared`
- Frontend only: `npm run test -w frontend`
- Mobile Playwright smoke tests against a migrated, seeded database: `npm run test:e2e`

## REST API

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Songs

- `GET /api/songs`
  - query: `q`, `page`, `pageSize`, `categoryId`, `tag`, `language`, `status`, `prioritizePinned`
- `GET /api/songs/:slug`
- `POST /api/songs`
- `PUT /api/songs/:id`
- `PATCH /api/songs/:id/pin`
- `DELETE /api/songs/:id`
- `POST /api/songs/:id/suggestions`
- `GET /api/songs/:id/revisions`

### Categories and Tags

- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/tags`
- `POST /api/tags`

### Lineups

- `GET /api/lineups`
- `GET /api/lineups/:id`
- `POST /api/lineups`
- `PUT /api/lineups/:id`
- `DELETE /api/lineups/:id`

### Admin and Health

- `GET /api/admin/dashboard`
- `GET /api/health`
- `GET /api/ready`

### Resources

- `GET /api/resources`
- `GET /api/resources/:slug`
- `GET /api/resources/:slug/pdf`
- `GET /api/resources/:slug/image`
- `POST /api/resources/text` admin only
- `POST /api/resources/pdf` admin only
- `POST /api/resources/image` admin only
- `PATCH /api/resources/:id` admin only
- `DELETE /api/resources/:id` admin only

## Role Rules

- `viewer`: read-only access to published songs and resources
- `editor`: can create and update songs, view revision history, view drafts
- `admin`: full editor access plus delete songs, manage categories, and upload/delete resources

## Database Notes

Tables included:

- `roles`
- `users`
- `categories`
- `tags`
- `songs`
- `song_tags`
- `song_revisions`
- `correction_suggestions`
- `resources`

Indexes are included for slug lookup, status/category filtering, updated ordering, trigram matching, and weighted text search over song title and artist.

## Documentation

- [Architecture](docs/architecture.md)
- [API](docs/api.md)
- [Database](docs/database.md)
- [Testing](docs/testing.md)
- [Deployment](docs/deployment.md)

## Production Notes

- Set a strong `JWT_SECRET`
- Serve the frontend through a CDN or reverse proxy
- Terminate TLS before the backend and keep cookie `secure` enabled in production
- Configure and verify an external backup job before deployment. It must include the PostgreSQL dump and `RESOURCES_UPLOAD_DIR`; PDF and image bytes are stored outside PostgreSQL. Backup automation is intentionally not included in this repository.
# music-chords

