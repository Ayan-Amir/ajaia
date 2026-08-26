# Deployment Guide — Neon + Railway + Vercel

All three services have free tiers. Railway's free trial includes a monthly credit that
comfortably covers an app this size.

**Order matters.** The backend needs the database URL and the frontend needs the backend
URL, so deploy Neon → Railway → Vercel → then return to Railway once for CORS.

Repo: `https://github.com/Ayan-Amir/ajaia`

---

## Step 1 — Database (Neon) ✅ already done

The Neon project is created, migrated, and seeded with the three demo accounts
(verified against Postgres 18.6).

Your connection string lives in `.env` as `DATABASE_URL` and looks like:

```
postgresql://neondb_owner:PASSWORD@ep-xxx-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

You'll paste that same value into Railway in Step 2.

> **Rotate the password first.** The connection string was shared in plain text during
> development. In Neon: **Roles → `neondb_owner` → Reset password**, then update both
> your local `.env` and Railway. Doing it before Step 2 means you only set it once.

> Railway can also provision its own Postgres (**New → Database → PostgreSQL**), which
> would auto-inject `DATABASE_URL` and skip Neon entirely. Since Neon is already set up
> and seeded, these instructions stay with Neon.

---

## Step 2 — Backend (Railway)

1. Sign up at **https://railway.app** with GitHub.
2. **New Project → Deploy from GitHub repo → `Ayan-Amir/ajaia`.**
3. Open the created service → **Settings**:

   | Setting | Value |
   | --- | --- |
   | **Root Directory** | `backend` |
   | Builder | Nixpacks (default) |
   | Start Command | leave empty — `backend/railway.json` supplies it |

   **Root Directory is the step people miss.** Without it Railway looks for
   `requirements.txt` at the repo root and the build fails.

4. **Variables** tab → add:

   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | your Neon connection string |
   | `SECRET_KEY` | any long random string (50+ chars) |
   | `DEBUG` | `False` |
   | `CORS_ALLOWED_ORIGINS` | leave blank for now — set in Step 4 |

   You do **not** need to set `ALLOWED_HOSTS`: settings.py reads Railway's
   `RAILWAY_PUBLIC_DOMAIN` and trusts it automatically.

5. **Settings → Networking → Generate Domain.** Railway creates something like
   `ajaia-production.up.railway.app`. Copy it.

6. Verify: open `https://<your-domain>/api/health/` — expect `{"status": "ok"}`.

`backend/railway.json` handles the rest: `collectstatic` at build time, then
`migrate` → `seed_demo` → `gunicorn` on start. `seed_demo` is idempotent, so restarts
always leave the three demo accounts in place.

---

## Step 3 — Frontend (Vercel)

1. Sign up at **https://vercel.com** with GitHub.
2. **Add New → Project** → import `Ayan-Amir/ajaia`.
3. Configure:

   | Field | Value |
   | --- | --- |
   | Framework Preset | Vite |
   | **Root Directory** | `frontend` |
   | Build Command | `npm run build` (default) |
   | Output Directory | `dist` (default) |

4. **Environment Variables** → add:

   | Key | Value |
   | --- | --- |
   | `VITE_API_URL` | `https://<your-domain>.up.railway.app` |

   **No trailing slash, no `/api` suffix** — the client appends `/api` itself. This is
   baked in at build time, so changing it later requires a redeploy.

5. **Deploy**, then copy the resulting URL (e.g. `https://ajaia-xxxx.vercel.app`).

`frontend/vercel.json` rewrites all routes to `index.html`, so refreshing on
`/documents/3` won't 404.

---

## Step 4 — Connect them (easy to forget)

Back in **Railway → Variables**, set:

```
CORS_ALLOWED_ORIGINS = https://ajaia-xxxx.vercel.app
```

Exact scheme and host, **no trailing slash**. Railway redeploys automatically.

Without this the site loads but every API call fails with a CORS error.

---

## Step 5 — Verify

Open your Vercel URL and walk through:

1. The picker lists Alice, Bob, and Carol → API reachable, CORS correct.
2. Sign in as **alice** → *My documents* and *Shared with me* both render.
3. Open a document, type, wait for **All changes saved**, refresh → text persists.
4. **Import file** with `.txt`, `.md`, or `.docx` → becomes a new document.
5. **Share** with **carol** as *Can view*.
6. Private window → sign in as **carol** → read-only, no Share button.

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Build fails, `requirements.txt` not found | Root Directory unset | Set `backend` (Railway) / `frontend` (Vercel) |
| `DisallowedHost` 400 | No public domain generated | Settings → Networking → Generate Domain |
| Accounts don't load on login page | CORS or wrong API URL | Check `CORS_ALLOWED_ORIGINS` and `VITE_API_URL` |
| Calls go to `localhost:8000` in production | `VITE_API_URL` unset at build | Set in Vercel, then **redeploy** |
| 404 on refresh at `/documents/3` | SPA rewrite missing | `vercel.json` must sit inside `frontend/` |
| `SSL connection required` | Neon suffix stripped | Keep `?sslmode=require` |
| Deploy succeeds, 502 on every request | Gunicorn not bound to `$PORT` | `railway.json` handles this — don't override the start command |

Railway's **Deployments → View Logs** shows build and runtime output, which is the
fastest way to diagnose a failed boot.

---

## Deployed

Both services are live; see `SUBMISSION.md` for the current URLs.

To redeploy, push to `main` — Railway and Vercel both build automatically from the
connected repo.
