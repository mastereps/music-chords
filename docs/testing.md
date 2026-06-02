# Testing

## Commands

```bash
npm test
npm run build
```

`npm test` runs shared transpose tests, backend schema tests, optional backend PostgreSQL integration tests, and frontend component tests.

Backend integration tests require a disposable database:

```bash
set TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/music_chords_test
npm run test -w backend
```

The integration suite resets tables and must never target development or production.

Mobile Playwright smoke tests require a migrated and seeded database plus Chromium:

```bash
npx playwright install chromium
npm run migrate
npm run seed -w backend
npm run build
npm run test:e2e
```

## Coverage Layers

- Shared tests verify sharps, flats, slash chords, compact chord sequences, lyric safety, spacing, and line breaks.
- Backend schema tests verify payloads, query coercion, category validation, lineup validation, resource validation, and malformed IDs.
- Backend integration tests verify readiness, auth cookies, roles, draft visibility, revisions, pinning, category cycles, lineup ordering, admin-only resource writes, public resource reads, and PDF/image signature checks.
- Frontend tests verify monospace chord preservation, transpose control wiring, song-form normalization, and resource permission controls.
- Playwright smoke tests verify the core mobile viewer transpose flow and admin login.

## CI

`.github/workflows/ci.yml` starts PostgreSQL, installs dependencies, runs migrations, executes tests, builds all workspaces, seeds sample data, and runs Playwright mobile smoke tests.
