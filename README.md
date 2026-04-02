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
5. Apply schema:
   `psql -U postgres -h localhost -p 5432 -d music_chords -f database/schema.sql`
6. If you already created the schema before the search review changes, also run:
   `psql -U postgres -h localhost -p 5432 -d music_chords -f database/migrations/002_search_indexes.sql`
7. Seed admin user and sample songs:
   `npm run seed -w backend`
8. Start the apps in separate terminals:
   - `npm run dev:backend`
   - `npm run dev:frontend`

If `npm run seed -w backend` fails with missing `DATABASE_URL` or `JWT_SECRET`, your `backend/.env` is missing or incomplete.

Default seeded admin credentials:

- Email: `admin@example.com`
- Password: `Admin123!`

## Build and Test

- Build all packages: `npm run build`
- Run tests: `npm run test`
- Backend only: `npm run test -w backend`
- Shared transpose tests only: `npm run test -w shared`

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

### Admin and Health

- `GET /api/admin/dashboard`
- `GET /api/health`

## Role Rules

- `viewer`: read-only access to published songs
- `editor`: can create and update songs, view revision history, view drafts
- `admin`: full editor access plus delete songs and manage categories

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

Indexes are included for slug lookup, status/category filtering, updated ordering, trigram matching, and weighted text search over song title and artist.

## Testing Scope

- Shared transpose logic covers sharps, flats, slash chords, spacing preservation, and lyric-line safety
- Backend validation tests cover login, song payloads, search params, and correction submission validation

## Production Notes

- Set a strong `JWT_SECRET`
- Serve the frontend through a CDN or reverse proxy
- Terminate TLS before the backend and keep cookie `secure` enabled in production
- Add PostgreSQL backups and monitoring before deployment
# music-chords

