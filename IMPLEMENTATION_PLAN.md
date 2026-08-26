# Implementation Plan

The technical plan for the build: structure, data model, API surface, frontend flow,
testing, and deployment. Written before implementation and reconciled with the finished
code afterwards, so it describes what actually shipped.

- **Scope, sequence, and where the plan changed** → `PLAN.md`
- **Why each tradeoff was made** → `ARCHITECTURE.md`

---

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19 + Vite + TypeScript, Tailwind v4, TanStack Query, React Router 7 |
| Editor | Tiptap 3 (StarterKit — Underline is bundled, not a separate extension) |
| Backend | Django 5.2 + Django REST Framework |
| Database | Postgres (Neon) in production, SQLite locally and under test |
| Auth | Seeded user picker issuing a DRF token (`Authorization: Token <key>`) |
| Deploy | Railway (backend) + Vercel (frontend) + Neon (database) |

Tokens rather than session cookies because the two halves deploy to different origins,
where `SameSite` cookie handling is a common "works locally, breaks in production" trap.

---

## Project structure

```
backend/
  config/         settings.py, urls.py, wsgi.py
  accounts/       serializers.py, views.py, urls.py     — seeded users, login, token
  documents/      models.py, choices.py, permissions.py,
                  serializers.py, services.py, views.py,
                  urls.py, tests.py
                  management/commands/seed_demo.py
  railway.json    collectstatic → migrate → seed → gunicorn
  requirements.txt

frontend/src/
  config/env.ts             single Zod-validated env access point
  services/api.ts           axios wrapper: attaches token, normalizes DRF errors
  context/AuthContext.tsx   sole source of auth state
  hooks/useAuth.ts
  data/documents.ts         TanStack Query hooks + query keys
  routes/                   routePaths.ts, RequireAuth.tsx
  types/                    auth.types.ts, document.types.ts
  pages/                    LoginPage, DashboardPage, EditorPage
  components/               EditorToolbar, ShareModal, DocumentCard
  utils/cn.ts
  vercel.json               SPA rewrite
```

One file per component, props types in `types/`, all HTTP behind `services/api.ts`,
`import.meta.env` read in exactly one place.

---

## Data model

Both models inherit `TimeStampedModel` from django-extensions (`created` / `modified`),
reused rather than hand-rolled.

**Document**
- `title` — CharField, default `"Untitled document"`
- `content` — **TextField holding sanitized HTML** (see note below)
- `owner` — FK `User`, `related_name="owned_documents"`, `on_delete=CASCADE`
- `Meta.ordering = ["-modified"]`
- `role_for(user)` — computes `OWNER` / `EDITOR` / `VIEWER` / `None` per request

**DocumentShare**
- `document` — FK, `related_name="shares"`, CASCADE
- `shared_with` — FK `User`, `related_name="document_shares"`, CASCADE
- `permission` — `SharePermission` TextChoices (`VIEW` / `EDIT`) in `choices.py`
- `UniqueConstraint(document, shared_with)` in `Meta.constraints`

> **Content is HTML, not ProseMirror JSON.** The original plan said JSON for fidelity.
> Both import paths (Markdown, Word) produce HTML and Tiptap round-trips HTML losslessly
> for the supported node set, so JSON would have required a Markdown→ProseMirror
> converter in Python for no gain. The tradeoff is that HTML is an injection surface, so
> every write passes through `sanitize_document_html()`.

`role` is computed, never stored, so it cannot drift from the underlying shares.

---

## API surface

| Method | Endpoint | Notes |
| --- | --- | --- |
| `GET` | `/api/auth/users/` | Seeded accounts — public (mocked auth, see README) |
| `POST` | `/api/auth/login/` | `{user_id}` → `{token, user}` |
| `GET` | `/api/auth/me/` | Current user |
| `GET` | `/api/documents/` | Owned + shared, each tagged with `role` |
| `POST` | `/api/documents/` | Create |
| `GET/PATCH/DELETE` | `/api/documents/{id}/` | Permission-checked |
| `POST` | `/api/documents/import/` | Multipart `.txt` / `.md` / `.docx` |
| `POST` | `/api/documents/{id}/shares/` | Grant or update — owner only |
| `DELETE` | `/api/documents/{id}/shares/{share_id}/` | Revoke — owner only |

**Layering.** Views are thin generics over a per-user queryset; serializers validate and
shape only; the two genuinely multi-step workflows live in `services.py`:

- `build_document_from_upload()` — extension check → size/decode → convert → sanitize → create
- `grant_share()` — `update_or_create` inside a transaction, so re-sharing changes the
  permission instead of duplicating the row

**Access control** (`permissions.py`)

| Action | Owner | Editor | Viewer | No access |
| --- | :-: | :-: | :-: | :-: |
| Read | ✅ | ✅ | ✅ | 404 |
| Update | ✅ | ✅ | 403 | 404 |
| Share / revoke | ✅ | 403 | 403 | 404 |
| Delete | ✅ | 403 | 403 | 404 |

`accessible_documents()` filters `Q(owner=user) | Q(shares__shared_with=user)` with
`select_related`/`prefetch_related`. No-access returns **404 rather than 403** — a 403
would confirm the document exists.

**Sanitization.** `ALLOWED_TAGS` mirrors exactly what the editor can produce. `<script>`
and `<style>` are dropped with their contents first (bleach otherwise keeps the inner
text), then bleach enforces the allowlist. Applied on both the edit and import paths.

---

## Frontend flow

1. **Login** — fetch seeded users, "Continue as…", store token + user, redirect.
2. **Dashboard** — *My documents* and *Shared with me* as separate sections with role
   badges; New document; Import file with client-side extension check (convenience — the
   API is the real boundary).
3. **Editor** — Tiptap with toolbar (B / I / U, heading select, bullet + numbered lists),
   inline rename, debounced autosave with a Saving…/Saved indicator, Share modal for
   owners, read-only for viewers, 404/403 → friendly "no longer have access".

**Autosave design.** Pending edits **merge** rather than replace, so renaming then typing
doesn't discard the rename; saves are skipped entirely for viewers; the pending patch is
flushed on unmount; and the list/detail query keys are namespaced (`["documents","list"]`
vs `["documents","detail",id]`) so a save can't invalidate and refetch over live typing.

---

## Testing

25 backend tests (`documents/tests.py`), DRF `APITestCase` with `setUpTestData` and
`force_authenticate`, asserting canonical DRF error bodies.

- **Access** — owner read, stranger 404, viewer read-only, editor can write, editor can't
  delete, rename, blank-title rejection, `<script>` stripped
- **Sharing** — owner shares, re-share updates rather than duplicates, self-share rejected,
  editor can't share, revoke, revoked user loses access
- **Import** — `.txt` structure, `.md` formatting, `.docx` via a real generated file,
  deep headings degrading to `h3`, HTML escaping, corrupt `.docx`, unsupported extension,
  unauthenticated

Tests run on SQLite by default (`TEST_DATABASE_URL` overrides) so the suite never
creates a `test_*` database on the shared cloud instance. Postgres compatibility was
verified separately by pointing it at a throwaway Postgres.

Frontend automated tests are the known gap — the budget went to permission logic, where
the risk actually lives. The UI was verified by scripted multi-user browser runs.

---

## Deployment

**Neon** → **Railway** (root `backend`, `railway.json` runs collectstatic → migrate →
seed → gunicorn on `$PORT`) → **Vercel** (root `frontend`, `VITE_API_URL`) → then set
`CORS_ALLOWED_ORIGINS` on Railway to the Vercel URL.

`settings.py` reads Railway's `RAILWAY_PUBLIC_DOMAIN` and trusts it automatically, so
`ALLOWED_HOSTS` needs no manual value. Production adds HSTS, nosniff, secure cookies, and
proxy SSL detection. Static files are served by whitenoise.

Full instructions and troubleshooting: `DEPLOYMENT.md`.
