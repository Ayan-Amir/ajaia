# Ajaia Docs — Collaborative Document Editor

A lightweight, Google-Docs-inspired collaborative document editor. Built as a
timeboxed take-home assignment (see `ARCHITECTURE.md` for scope decisions).

**Stack:** React (Vite + TypeScript) · Django + Django REST Framework · Postgres/SQLite · Tiptap

---

## What works end to end

- **Documents** — create, rename, rich-text edit, delete, autosave, reopen after refresh
- **Rich text** — bold, italic, underline, H1/H2/H3, bulleted and numbered lists
- **File import** — upload a `.txt`, `.md`, or `.docx` file to create a new editable
  document (**supported types: `.txt`, `.md` and `.docx` only**, max 1MB — enforced in
  the UI *and* the API). Word headings, bold/italic and lists carry over; images,
  tables and links are dropped, since the editor has no way to represent them.
- **Sharing** — a document owner can grant another user **view** or **edit** access, change
  that permission, or revoke it
- **Access control** — owned vs. shared documents are visually separated on the dashboard;
  viewers get a read-only editor; non-owners cannot share; only owners can delete
- **Persistence** — documents, formatting, and shares survive refresh and restart

## Seeded test accounts

Auth is intentionally mocked (see `ARCHITECTURE.md`): pick an account, no password.

| User | Username | Starting state |
| --- | --- | --- |
| Alice Nguyen | `alice` | Owns *Welcome to Ajaia Docs* and *Q3 Planning Notes* |
| Bob Martinez | `bob` | Has **edit** access to Alice's *Q3 Planning Notes* |
| Carol Osei | `carol` | No documents — useful for testing the "no access" path |

**To demo sharing:** sign in as `alice`, open a document, click **Share**, grant `carol`
view access, then sign in as `carol` in a private window to see the read-only view.

---

## Local setup

Requires **Python 3.11+** and **Node 18+**.

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env              # defaults work as-is for local dev

python manage.py migrate
python manage.py seed_demo        # creates the 3 users + demo documents
python manage.py runserver        # http://localhost:8000
```

By default this uses a local SQLite file. To use Postgres instead, set
`DATABASE_URL` in `backend/.env` and re-run `migrate` and `seed_demo`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env              # points at http://localhost:8000
npm run dev                       # http://localhost:3000
```

Open **http://localhost:3000** and pick a seeded account.

### Running the tests

```bash
cd backend && source venv/bin/activate && python manage.py test
```

25 tests covering the permission matrix, sharing behaviour, import handling, and
HTML sanitization. See `ARCHITECTURE.md` for why test depth is concentrated here.

---

## API reference

All endpoints are under `/api`. Authenticated requests send `Authorization: Token <token>`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/auth/users/` | List seeded accounts (public — see note below) |
| `POST` | `/auth/login/` | `{user_id}` → `{token, user}` |
| `GET` | `/auth/me/` | Current user |
| `GET` | `/documents/` | Documents you own or that are shared with you, each tagged with `role` |
| `POST` | `/documents/` | Create a document |
| `GET/PATCH/DELETE` | `/documents/{id}/` | Read / update / delete (permission-checked) |
| `POST` | `/documents/import/` | Multipart `.txt`/`.md`/`.docx` upload → new document |
| `POST` | `/documents/{id}/shares/` | `{user_id, permission}` — owner only |
| `DELETE` | `/documents/{id}/shares/{share_id}/` | Revoke a share — owner only |

**Permission matrix**

| Action | Owner | Editor | Viewer | No access |
| --- | :-: | :-: | :-: | :-: |
| Read | ✅ | ✅ | ✅ | 404 |
| Edit content / title | ✅ | ✅ | 403 | 404 |
| Share / revoke | ✅ | 403 | 403 | 404 |
| Delete | ✅ | 403 | 403 | 404 |

Documents you have no access to return **404, not 403** — the queryset never exposes
their existence.

> **Note:** `/auth/users/` is public because auth is mocked and passwordless for this
> demo, so the account list is not a secret. A production build would require
> authentication here.

---

## Deployment

The app deploys as two services plus a hosted database, all on free tiers:
**Neon** (Postgres) → **Railway** (Django API) → **Vercel** (React frontend).

**See [DEPLOYMENT.md](DEPLOYMENT.md) for the full step-by-step guide**, including the
exact environment variables and a troubleshooting table.

Short version: deploy in that order, because the backend needs the database URL and the
frontend needs the backend URL — then set `CORS_ALLOWED_ORIGINS` on Railway to the final
Vercel URL.

Deployment config lives in `backend/railway.json` (build, migrate, seed, gunicorn) and
`frontend/vercel.json` (SPA routing).

---

## Project structure

```
backend/
  config/           settings, urls, wsgi
  accounts/         seeded users, mocked login, token issuance
  documents/        models, choices, permissions, services, views, serializers, tests
frontend/src/
  config/env.ts     single validated env access point
  services/api.ts   axios wrapper (attaches token, normalizes errors)
  context/          AuthContext — the only auth-state source
  data/documents.ts TanStack Query hooks
  pages/            Login, Dashboard, Editor
  components/       EditorToolbar, ShareModal, DocumentCard
```

See `ARCHITECTURE.md` for design decisions and `AI_WORKFLOW.md` for the AI-usage note.
