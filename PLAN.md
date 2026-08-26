# Implementation Plan

The plan I set out with, the order I built in, and where reality diverged from it.
Written before implementation and updated afterwards to stay honest — a plan that
quietly matches the finished product usually means it was rewritten at the end.

For *why* the tradeoffs were made, see `ARCHITECTURE.md`. This document is about
**sequence and scope**.

---

## The scoping bet

The brief asks for a Google-Docs-style editor in 4–6 hours and explicitly rewards
"depth in a few important areas over shallow coverage everywhere."

So the plan was built around one decision: **pick the area where a bug is invisible in a
demo but serious in reality, and be genuinely correct about it.** That's access control —
a viewer who can silently write, or a document reachable by someone it was never shared
with. Everything else was scoped to "coherent and usable."

Concretely that meant deciding up front what *not* to build: real-time collaboration,
version history, comments, link sharing, roles beyond view/edit, and real authentication.

---

## Stack decisions (made before writing code)

| Layer | Choice | Reason |
| --- | --- | --- |
| Frontend | React + Vite + TypeScript | Fast dev loop, matches my day-to-day stack |
| Backend | Django + DRF | Permission classes and the ORM do most of the access-control work |
| Database | Postgres on Neon | Free tier, and the deploy target can't use an ephemeral filesystem |
| Editor | Tiptap | ProseMirror underneath, React-native API, formatting extensions built in |
| Auth | Seeded user picker | Brief explicitly allows mocked auth; real login proves nothing it asks about |
| Transport | DRF token in a header | Frontend and backend are on different origins; avoids cross-origin cookie issues |

---

## Build order

Sequenced so the riskiest thing was provable earliest, and so each phase left the app
in a working state.

**1 · Data model and permissions.** `Document` and `DocumentShare`, the role computation,
and the DRF permission class. Done first because everything else depends on the shape of
access control.

**2 · The permission test suite.** Written immediately after the model, before any UI —
the owner / editor / viewer / no-access matrix, plus share grant, update, and revoke.
Testing this first meant the rules were pinned down before any interface assumed them.

**3 · The API.** Thin generic views over a per-user queryset, serializers for
validation/shaping only, and the two genuinely multi-step workflows — granting a share
and importing a file — pushed into `services.py`.

**4 · Frontend shell.** Auth context, typed API client, routing, and the owned-vs-shared
dashboard.

**5 · The editor.** Tiptap with a formatting toolbar, inline rename, and debounced
autosave with a visible save indicator.

**6 · File import.** One path, server-side conversion, sanitized on the way in.

**7 · Verification in a real browser.** Scripted multi-user flows asserting on live DOM
state — not a formality, and it's where the real bugs turned up.

**8 · Documentation and deployment.**

---

## Where the plan changed during the build

Recorded because these are the interesting parts — a plan is a hypothesis, and these
are the places it was wrong.

**Storage format: ProseMirror JSON → sanitized HTML.** The plan said store the editor's
JSON for fidelity. While building the import path it became obvious that Markdown and
Word conversion both produce HTML, and Tiptap round-trips HTML losslessly for the node
set here — so JSON would have meant writing a Markdown→ProseMirror converter in Python
for no fidelity gain. Switched, and added a strict sanitizer as the security boundary
that HTML now requires.

**`.docx` import: cut → included.** Originally deprioritized to protect the timebox, on
the reasoning that one working import path demonstrated the capability. Reinstated once
the core was solid, since the brief names `.docx` explicitly. Mammoth handles the
conversion; the existing sanitizer already covered the output.

**Frontend conventions: adopted selectively.** The repo carries a `.cursor/skills`
library written for a much larger product. The plan assumed it would be followed; in
practice applying it wholesale would have contradicted its own top-level rule against
unrequested abstractions. About half was adopted and the rest deliberately skipped.

**Test scope: backend-weighted, by choice.** The plan hoped for tests on both sides. The
budget went to the backend permission matrix, because that's where a defect actually
costs something. Frontend testing remains the known gap.

**Backend host: Render → Railway.** Changed at deploy time. `railway.json` replaced
`render.yaml` and the Heroku-style `Procfile`.

---

## What the plan got right

- **Testing permissions before building UI.** Meant the interface was written against
  rules that were already proven, rather than assumed.
- **Front-loading the data model.** No migrations had to be rewritten.
- **Budgeting time for real browser verification.** Three bugs — autosave corrupting
  documents, the formatting toolbar silently failing, and renaming discarding the rename
  — passed the type-checker, the build, and the entire test suite, and were only caught
  by driving the running app. Details in `ARCHITECTURE.md`.

---

## Next increment (2–4 hours)

In priority order: frontend tests for the editor's save and permission states; version
history (an append-only revision per save, with the timestamps already in place);
presence indicators via polling; optimistic concurrency so simultaneous edits surface a
conflict instead of silently overwriting; and Markdown/PDF export to complement import.
