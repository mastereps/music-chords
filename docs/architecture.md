# Architecture

## Overview

Music Chords is a mobile-first, chords-only web application. It has no audio, playback, or streaming features.

The repository is an npm workspace with three packages:

- `frontend/`: React, TypeScript, Vite, and Tailwind CSS.
- `backend/`: Express, TypeScript, Zod, cookie JWT auth, and PostgreSQL access through `pg`.
- `shared/`: shared DTOs and chord transposition utilities.

## Frontend

`frontend/src/api/client.ts` is the only HTTP client. Requests use `credentials: 'include'` so the HTTP-only auth cookie is included automatically.

`frontend/src/app/App.tsx` defines public and role-protected routes. Pages use small components and hooks. Chord sheets are rendered by `ChordSheet` inside a `<pre>` block with monospace styling so spacing and line breaks remain intact.

Transposition is client-side only. The stored chord content is never rewritten when a viewer changes key.

## Backend

The normal backend flow is:

```text
route -> auth middleware -> controller -> Zod schema -> service -> PostgreSQL pool
```

Controllers validate request bodies, query strings, and path parameters. Services own business rules and SQL transactions. Expected failures use `AppError`; unexpected failures are logged by the centralized error middleware.

`GET /api/health` is a liveness endpoint. `GET /api/ready` checks PostgreSQL connectivity and should be used by deployment checks.

## Database

PostgreSQL is the source of truth for users, categories, tags, songs, revisions, suggestions, lineups, and resource metadata. Pasted resource text is stored in PostgreSQL. Uploaded PDF and image bytes are stored in `RESOURCES_UPLOAD_DIR` and linked from PostgreSQL metadata. The backend uses a shared `pg.Pool` with bounded connections and error logging.

Database changes are applied by `npm run migrate`. The migration runner serializes execution with a PostgreSQL advisory lock and records completed filenames in `schema_migrations`.

## Auth And Roles

Login creates a signed JWT stored in the `music_chords_token` HTTP-only cookie.

- `viewer`: published songs and public lineups only.
- `editor`: song editing, revisions, tags, drafts, and lineup management.
- `admin`: editor access plus pinning, song deletion, category management, and resource upload/delete.

Resource listing and viewing are public. Resource upload and deletion are admin-only.
