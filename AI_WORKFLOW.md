# AI Workflow Note

> Please review and adjust this before submitting — it should describe *your*
> experience of the build, and only you can vouch for the parts about judgment.

## Tools used

- **Claude Code (Sonnet 5)** — the primary tool, used for planning, implementation,
  and verification.
- **Playwright**, driven by Claude Code, to exercise the running app in a real
  browser rather than trusting that the UI worked.

## Where AI materially sped things up

**Scaffolding and boilerplate.** Django settings, DRF serializers, URL wiring, the Vite
setup, Tailwind config, and the repetitive React plumbing (context, query hooks, typed
API client) were generated far faster than typing them. This is the least interesting
speedup but the largest in raw minutes.

**Reading an unfamiliar convention library.** The repo carries a large `.cursor/skills`
directory. Two parallel agents read all of it and reported back the concrete rules, which
would have been 30+ minutes of manual reading.

**Writing the permission test matrix.** Once the permission rules were decided,
enumerating 22 owner/editor/viewer/no-access cases is mechanical work that AI does
quickly and thoroughly.

**Verification, not just generation.** The highest-value use was scripting a browser to
log in as three different users and assert on real behaviour. That's what caught the
serious bugs below.

## What I changed or rejected

**Rejected wholesale application of the in-repo skills library.** The conventions are
written for a large product — per-view file splitting, Zustand, a CVA design-token
system, MSW test infrastructure, layered error boundaries. Following all of it in a
4-6 hour build would have contradicted the library's own rule against unrequested
abstractions. Roughly half was adopted and the rest deliberately skipped, with the
reasoning recorded in `ARCHITECTURE.md`.

**Changed the storage format mid-build.** The plan said store ProseMirror JSON. While
implementing the Markdown import path it became clear that JSON would require writing a
Markdown→ProseMirror converter in Python for no fidelity gain, so content is stored as
HTML behind a strict sanitizer instead. Rejecting your own earlier plan when the code
tells you something is part of the work.

**Caught a wrong dependency.** `pip install python-markdown` resolved to an unrelated
stale package rather than the real `Markdown` library. Worth noting because plausible-
looking package names are a standard failure mode of AI-suggested install commands.

**Removed a redundant dependency.** `@tiptap/extension-underline` was installed before
checking — StarterKit v3 already bundles Underline, so installing it separately would
have registered a duplicate extension.

## How correctness was verified

**Automated tests (backend, 22 tests).** Every cell of the permission matrix, share
grant/update/revoke, import handling for both file types, rejection of unsupported types,
and HTML sanitization on both write paths.

**Real browser runs, which is where the real bugs were.** Scripted flows logged in as
three users and asserted on live DOM state. This caught three defects that the passing
test suite did not:

1. **Autosave was destroying document content.** The TanStack list query key was a prefix
   of the detail key, so every save refetched a stale snapshot over the user's typing. The
   symptom was a document that saved as `<h1>Launch Checklist</h1><p>Normal paragraph then
   ullet</p>` — visibly mangled. Fixed by separating the key namespaces.
2. **The formatting toolbar silently didn't work.** Clicking Bold blurred the editor
   before the click handler ran, so the format applied to a lost selection and the first
   typed characters disappeared. Fixed with `preventDefault` on `mousedown`.
3. **Renaming then typing discarded the rename**, because the debounce replaced the
   pending payload instead of merging it.

None of these would have been caught by unit tests or by reading the diff. The lesson I'd
draw: AI-generated code that type-checks, builds, and passes its tests can still be
straightforwardly broken in the browser, and "run it and use it" remains non-optional.

**Manual review of the security boundary.** The sanitizer allowlist was checked by hand
against what the editor can actually produce, and an initial version was tightened after
noticing bleach strips `<script>` tags but keeps their text content.
