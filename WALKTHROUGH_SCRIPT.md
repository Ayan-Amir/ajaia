# Walkthrough Video Script (~4:15)

> Working notes for recording — delete this file before you zip the submission if you
> don't want reviewers to see it.
>
> **Adjust the AI section (5) so it describes your actual experience.** Everything else
> is factual and verified; that part has to be yours.

---

## Before you hit record

- [ ] Open **https://ajaia-tau.vercel.app** once to warm it up
- [ ] Reset demo data so the dashboard is clean:
      `cd backend && source venv/bin/activate && python manage.py flush --noinput && python manage.py seed_demo`
- [ ] **Two browser windows**, side by side or easy to alt-tab:
      - Window A: normal → you'll be Alice
      - Window B: **incognito** → you'll be Carol (separate session; this is what makes
        the sharing demo believable)
- [ ] Have a `.docx` file on your desktop ready to drag in
- [ ] Zoom the browser to ~110% so text is readable in the recording
- [ ] Close bookmarks bar, notifications, extra tabs

---

## 1 · Opening — what this is (0:00–0:25)

> "Hi, I'm Ayyan. This is Ajaia Docs, a lightweight collaborative document editor —
> a scoped-down take on Google Docs, built with React on the front end and Django REST
> Framework on the back, with Postgres on Neon."
>
> "I had four to six hours, so rather than spreading thin across every Docs feature, I
> went deep on one thing: **getting sharing and access control genuinely right.** I'll
> show you the product first, then talk through the decisions."

**[SHOW]** The live URL in the address bar, then the login screen.

---

## 2 · Sign-in and the dashboard (0:25–0:55)

> "Auth is intentionally mocked — you pick a seeded account, no password. The brief
> allowed that, and real authentication would have eaten hours while demonstrating
> nothing the assignment actually asks about. Behind the scenes it's a real token, so
> the *authorization* path — which is the part that matters — is real."

**[SHOW]** Click **Alice Nguyen**.

> "Straight away you can see the core idea: documents are split into **My documents** and
> **Shared with me**, and everything shared carries a badge saying what you can do with it
> — 'Can edit' or 'View only'."

**[SHOW]** Point at the two sections and the role badges.

---

## 3 · Creating and editing (0:55–1:45)

**[SHOW]** Click **New document**.

> "New document, and we're straight into the editor. Let me rename it..."

**[SHOW]** Type `Launch Checklist` in the title.

> "...and the formatting is what you'd expect: headings, bold, italic, underline,
> bulleted and numbered lists."

**[SHOW]** Type a heading, switch to Normal text, type a sentence, bold a couple of
words, then add two bullets. Keep it quick — this is muscle memory, not a tour.

> "Note the indicator up here — it says *Saving*, then *All changes saved*. It's a
> debounced autosave, so it isn't hammering the API on every keystroke."

**[SHOW]** Point at the save indicator. Then **refresh the page**.

> "And a refresh brings it back exactly as it was — the formatting is persisted, not
> just the text."

---

## 4 · File import (1:45–2:20)

**[SHOW]** Back to Documents → **Import file** → pick your `.docx`.

> "You can bring existing work in. I support `.txt`, `.md`, and `.docx` — and that's
> stated in the UI, not buried in a README."

**[SHOW]** The imported document open in the editor.

> "A Word file comes through as a real editable document — headings, bold, lists all
> survive the conversion. Images and tables get dropped, deliberately: the editor has no
> way to represent them, so storing them would just produce markup the user can't see or
> edit."
>
> "And the limits are enforced on the server too, not just the file picker — the browser
> check is a convenience, the API is the actual boundary."

---

## 5 · Sharing — the part I went deep on (2:20–3:10)

**[SHOW]** Open **Launch Checklist** → click **Share**.

> "Here's what I spent most of my time on. I share this with Carol as **view only**."

**[SHOW]** Select Carol, permission *Can view*, click Share. Point at the access list.

> "You can see who has access, change permissions, or revoke. Now let's check it's real."

**[SHOW]** Switch to **incognito window** → sign in as **Carol** → open the document.

> "Carol sees it under *Shared with me*, flagged **View only** — and the editor is
> genuinely read-only. There's no Share button, because she's not the owner."

**[SHOW]** Try typing in the editor. Nothing happens.

> "This isn't just hidden UI. The server enforces the same rules — a viewer gets a 403 if
> they try to write, and if you're not on the share list at all you get a **404, not a
> 403**, because a 403 would confirm the document exists. There are 25 backend tests
> covering every cell of that owner / editor / viewer / no-access matrix."

---

## 6 · Decisions and tradeoffs (3:10–3:45)

> "Three decisions worth calling out."
>
> "**First — what I cut.** Real-time collaboration. CRDTs plus a websocket layer would
> have consumed the entire budget and left everything else shallow. So this is
> last-write-wins: two people editing at once will overwrite each other. That's an honest
> limitation, and it's written down in the architecture note, not hidden."
>
> "**Second — storage.** Content is stored as sanitized HTML rather than the editor's
> JSON. I actually planned the opposite, then switched while building: Markdown and Word
> import both produce HTML, and Tiptap round-trips HTML losslessly for the formatting I
> support. Storing JSON would have meant writing a converter for no fidelity gain. The
> cost is that HTML is an injection surface, so every single write goes through a strict
> sanitizer, with tests proving script tags get stripped on both the edit and import
> paths."
>
> "**Third — I skipped things on purpose.** No version history, no comments, no roles
> beyond view and edit. All listed in the architecture note, along with what I'd build
> next with another few hours — frontend tests first, then version history."

---

## 7 · How AI fitted in (3:45–4:15)

> ⚠️ **Rewrite this in your own words — it has to be your experience.**

> "On AI: I used Claude Code throughout. The biggest wins were scaffolding — Django
> settings, serializers, the React plumbing — and enumerating that permission test matrix,
> which is mechanical work."
>
> "But the part I'd actually highlight is using it for **verification, not just
> generation**. I had it drive a real browser as three different users and assert on live
> behaviour. That caught three bugs that had already passed the test suite and the build:
> autosave was silently corrupting documents because of a query-cache key collision, the
> formatting toolbar didn't work because clicking a button stole focus from the editor,
> and renaming a document then typing discarded the rename."
>
> "None of those would have shown up in a code review or a unit test. That's the lesson
> I'd take from this: AI-generated code that type-checks and passes its tests can still be
> plainly broken in the browser, so actually running it isn't optional."
>
> "I also rejected plenty — I didn't apply my own conventions library wholesale because
> most of it is written for a much larger codebase, and following all of it here would
> have contradicted its own rule against unnecessary abstraction."
>
> "That's Ajaia Docs. Thanks for watching."

---

## Timing check

| Section | Runs | Cumulative |
| --- | --- | --- |
| 1 · Opening | 0:25 | 0:25 |
| 2 · Sign-in + dashboard | 0:30 | 0:55 |
| 3 · Create + edit | 0:50 | 1:45 |
| 4 · Import | 0:35 | 2:20 |
| 5 · Sharing | 0:50 | 3:10 |
| 6 · Decisions | 0:35 | 3:45 |
| 7 · AI workflow | 0:30 | 4:15 |

Comfortably inside the 3–5 minute window. **If you're running long, trim section 3** —
the editing demo is the most self-explanatory part. Never trim 5 or 6; sharing and
tradeoffs are what's actually being assessed.

## Delivery notes

- **Don't read this aloud verbatim** — it'll sound like it. Know the beats, speak naturally.
- Narrate *while* clicking, not before or after. Dead air reads as hesitation.
- If you fluff a line, keep going. One take with a stumble beats six restarts.
- The single most persuasive moment is Carol failing to type in the read-only editor.
  Let that land for a beat before you move on.
