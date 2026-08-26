# Submission — Ajaia AI-Native Full Stack Developer Assignment

**Candidate:** Ayyan Amir (ayyanamir6@gmail.com)

All links below are live and were verified end to end.

## Links

| Item | Link |
| --- | --- |
| Live product URL | https://ajaia-tau.vercel.app |
| Source code (GitHub) | https://github.com/Ayan-Amir/ajaia |
| Backend API | https://ajaia-docs-api-production.up.railway.app |
| Walkthrough video — part 1 | https://www.loom.com/share/d298db6c1f104f46813f670dbe5f66a7 |
| Walkthrough video — part 2 | https://www.loom.com/share/6f5de69f588347c8ae8266384206ccf4 |
| Google Drive (`ajaia.zip`) | https://drive.google.com/file/d/1LwcTYyOLyqFkR7M7bJ_9ZWCvYgn4OA6a/view?usp=sharing |

## Test accounts

No passwords — sign in by picking an account from the list.

| User | Username | Starting state |
| --- | --- | --- |
| Alice Nguyen | `alice` | Owns two documents, one shared with Bob |
| Bob Martinez | `bob` | Has **edit** access to Alice's *Q3 Planning Notes* |
| Carol Osei | `carol` | No documents — use to test the "no access" path |

**Suggested review path:** sign in as `alice` → open *Welcome to Ajaia Docs* → edit and
watch it autosave → **Share** with `carol` as *Can view* → sign in as `carol` in a private
window → confirm the document is read-only and the Share button is absent.

## What's included

| File | Contents |
| --- | --- |
| `README.md` | Feature list, local setup, seeded accounts, API reference, deployment steps |
| `ARCHITECTURE.md` | What was prioritized, tradeoffs, known gaps, what I'd build next |
| `AI_WORKFLOW.md` | AI tools used, what was changed/rejected, how correctness was verified |
| `SUBMISSION.md` | This file |
| `backend/` | Django + DRF API, 25 automated tests |
| `frontend/` | React + TypeScript + Tiptap client |
| `DEPLOYMENT.md` | Step-by-step Neon + Railway + Vercel deployment guide |
| `backend/railway.json`, `frontend/vercel.json` | Deployment configuration |
| `VIDEO.txt` | Walkthrough video URLs |
| `screenshots/` | Screenshots of the main flows |

## Status

**Working end to end:** document create / rename / rich-text edit / delete, autosave and
reopen, `.txt` / `.md` / `.docx` import, user-to-user sharing with view vs. edit permissions,
permission changes and revocation, owned vs. shared separation, read-only enforcement for
viewers, and persistence across refresh.

**Intentionally not built:** real-time collaboration (last write wins), version history,
comments/suggestion mode, link sharing, and roles beyond view/edit.

**Known gaps:** no frontend automated tests (backend permission logic was prioritized
instead); simultaneous editors overwrite each other.

**Next with 2-4 more hours:** frontend tests, version history, presence indicators,
optimistic concurrency to turn silent overwrites into visible conflicts, and
Markdown/PDF export. Reasoning for each is in `ARCHITECTURE.md`.

## Verify locally

```bash
# Backend
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt && cp .env.example .env
python manage.py migrate && python manage.py seed_demo
python manage.py test          # 25 tests
python manage.py runserver

# Frontend (second terminal)
cd frontend && npm install && cp .env.example .env && npm run dev
```

Then open http://localhost:3000.
