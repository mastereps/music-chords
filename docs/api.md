# REST API

All endpoints return JSON. Validation failures return HTTP `400` with a `message` and Zod `errors`. Protected endpoints return `401` for missing authentication and `403` for insufficient roles.

## Health

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Process liveness |
| `GET` | `/api/ready` | Public | PostgreSQL readiness |

## Auth

| Method | Path | Access |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Authenticated |
| `POST` | `/api/auth/logout` | Authenticated |

Login body:

```json
{ "email": "admin@example.com", "password": "Admin123!" }
```

## Songs

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/api/songs` | Public |
| `GET` | `/api/songs/:slug` | Public |
| `POST` | `/api/songs` | Admin, editor |
| `PUT` | `/api/songs/:id` | Admin, editor |
| `PATCH` | `/api/songs/:id/pin` | Admin |
| `DELETE` | `/api/songs/:id` | Admin |
| `POST` | `/api/songs/:id/suggestions` | Public |
| `GET` | `/api/songs/:id/revisions` | Admin, editor |

`GET /api/songs` accepts `q`, `page`, `pageSize`, `categoryId`, `artist`, `tag`, `language`, `status`, and `prioritizePinned`. Public callers only receive published songs.

Song writes require title, key, slug, chord content, tags, and status. Slugs contain lowercase letters, digits, and hyphens only.

## Categories And Tags

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/api/categories` | Public |
| `POST` | `/api/categories` | Admin |
| `PUT` | `/api/categories/:id` | Admin |
| `DELETE` | `/api/categories/:id` | Admin |
| `GET` | `/api/tags` | Public |
| `POST` | `/api/tags` | Admin, editor |

Categories support parent-child relationships. The backend prevents hierarchy cycles and refuses deletion while songs or child categories still reference a category.

## Lineups

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/api/lineups` | Public |
| `GET` | `/api/lineups/:id` | Public |
| `POST` | `/api/lineups` | Admin, editor |
| `PUT` | `/api/lineups/:id` | Admin, editor |
| `DELETE` | `/api/lineups/:id` | Admin, editor |

Lineup write body:

```json
{
  "title": "Sunday service",
  "description": "Opening set",
  "songIds": [3, 8, 2]
}
```

Lineups require at least one unique, published song. Song order is preserved.

## Admin

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/api/admin/dashboard` | Admin, editor |

## Resources

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/resources` | Public | List documents |
| `GET` | `/api/resources/:slug` | Public | Get document metadata or pasted text |
| `GET` | `/api/resources/:slug/pdf` | Public | View an uploaded PDF inline |
| `GET` | `/api/resources/:slug/image` | Public | View an uploaded image |
| `POST` | `/api/resources/text` | Admin | Publish pasted text |
| `POST` | `/api/resources/pdf` | Admin | Upload a PDF |
| `POST` | `/api/resources/image` | Admin | Upload an image |
| `DELETE` | `/api/resources/:id` | Admin | Delete a document |

File uploads use a raw request body and the `title`, `slug`, and `filename` query parameters. PDFs use `Content-Type: application/pdf`. Images support `image/jpeg`, `image/png`, and `image/webp`. Uploads are limited to 10 MB. Editors and viewers have read-only resource access.
