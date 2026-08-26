# Architecture Note

The brief rewards depth in a few areas over shallow coverage everywhere. I picked
**access control** as the area to be genuinely correct about, because it is the one
place where a bug is invisible in a demo but serious in reality — a viewer who can
silently write, or a document that leaks to a non-collaborator. Everything else was
scoped to "coherent and usable" rather than complete.

## What I prioritized

1. **A correct, tested permission model.** One `IsOwnerOrSharedWith` permission class
   plus a per-user queryset, exercised by 22 tests covering every cell of the
   owner/editor/viewer/no-access matrix.
2. **An editing experience that feels normal.** Debounced autosave with a visible
   save indicator, inline rename, formatting that survives a refresh.
3. **A sharing flow you can actually demo.** Two seeded users, one pre-shared
   document, and a share dialog that shows current access and lets you revoke it.

## Key decisions and tradeoffs

**Content is stored as sanitized HTML, not ProseMirror JSON.**
I planned to store the editor's JSON, then switched while building. Markdown import
produces HTML, and Tiptap round-trips HTML losslessly for the node set here
(paragraphs, three heading levels, bold/italic/underline, both list types). Storing
JSON would have meant writing a Markdown→ProseMirror converter in Python for no
fidelity gain. The cost is that HTML is an injection surface, so **every write goes
through `sanitize_document_html()`** with a strict tag allowlist that mirrors the
editor's capabilities — there are tests asserting `<script>` is stripped on both the
edit and import paths.

**Auth is a passwordless user picker.** The brief explicitly allows mocked auth. Real
auth would have consumed a meaningful share of the budget and demonstrated nothing the
brief asks about. It's a DRF token behind the scenes, so the authorization path is real
even though authentication is not — swapping in a real login later touches one endpoint.

**Tokens, not session cookies.** Frontend and backend deploy to different origins.
Cross-origin `SameSite` cookie handling is a classic source of "works locally, breaks in
production," and a token in the `Authorization` header sidesteps it entirely.

**No-access returns 404, not 403.** A 403 confirms a document exists. The queryset
simply never includes documents you can't reach.

**Last-write-wins, not real-time collaboration.** Real-time co-editing (CRDTs/OT plus a
websocket layer) is the single largest thing I cut. It would have consumed the entire
budget and left the rest thin. Two people editing simultaneously will overwrite each
other — an honest limitation, not an oversight.

**Conventions: adopted selectively, deliberately.** The repo ships a `.cursor/skills`
library written for a much larger product (per-view file splitting, Zustand, a CVA
design-token system, MSW test infrastructure, three-tier error boundaries). Applying all
of it here would have contradicted its own top-level rule — *"no abstractions that
weren't explicitly requested."* So I took the cheap, high-value conventions (service
layer for multi-step logic, `TextChoices`, `UniqueConstraint`, `related_name`, a single
validated env module, centralized route paths and messages, one component per file) and
skipped the ones that only pay off at scale. TanStack Query stayed because it removes
hand-rolled loading/error state for near-zero cost.

## Data model

```
User (django.contrib.auth)
 └─ owned_documents ──> Document (title, content: sanitized HTML, owner)
                          └─ shares ──> DocumentShare (shared_with, permission: VIEW|EDIT)
                                        unique per (document, shared_with)
```

`role` is computed per request rather than stored, so it can never drift from the
underlying shares. Both models inherit `TimeStampedModel` (`created`/`modified`).

## Two bugs worth recording

Both were found by driving the real UI in a browser, not by unit tests — which is
precisely why that step was worth the time.

1. **Autosave was destroying content.** The list query key `["documents"]` was a *prefix*
   of the detail key `["documents", id]`, so every save invalidated the document being
   edited and refetched a stale snapshot over the user's in-flight typing. Keys are now
   `["documents","list"]` and `["documents","detail",id]`, and the detail query no longer
   refetches while mounted.
2. **Toolbar buttons silently dropped formatting.** Clicking Bold blurred the editor
   before the handler ran, so the format applied to a lost selection and the next
   keystrokes vanished. Fixed by preventing the default on `mousedown`.

A third, smaller one: the debounce *replaced* the pending payload instead of merging it,
so renaming a document and then typing discarded the rename.

## What is incomplete

- **No real-time collaboration.** Last write wins; no presence indicators.
- **No version history**, comments, or suggestion mode.
- **`.docx` import drops images, tables and links.** Headings, bold/italic and lists
  convert; anything the editor cannot represent is stripped by the sanitizer rather
  than stored as unusable markup.
- **Sharing is per-user only** — no link sharing, no org/role tiers beyond view/edit.
- **Frontend has no automated tests.** Test budget went to the backend permission logic,
  which is where the risk actually lives. The UI was verified by scripted browser runs
  covering the full multi-user flow, but that harness isn't part of the repo.
- **Nested list indentation** and other advanced formatting are not exposed in the toolbar.

## What I'd build next, with another 2-4 hours

1. **Frontend tests** (Vitest + RTL + MSW) for the editor's save/permission states —
   the biggest genuine gap.
2. **Version history.** `created`/`modified` are already there; an append-only revision
   row per save plus a diff view is a contained, high-value feature.
3. **Presence indicators** — "Bob is viewing" via polling. Most of the perceived value of
   real-time collaboration for a fraction of the cost of true co-editing.
4. **Optimistic concurrency.** Send the last-known `modified` with each save and reject
   stale writes, which turns silent overwrites into a visible conflict.
5. **Export to Markdown/PDF**, the natural complement to the existing import path.
