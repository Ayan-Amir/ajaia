---
name: design-system
description: >-
  Canonical visual reference for the CATS (Cogent Labs ATS) UI. Covers every
  token, CSS component class, layout pattern, and rule required to build
  pixel-accurate staff-portal screens. Use whenever building or reviewing any
  React UI in frontend/ats/ or frontend/career/. NOT a substitute for
  styling-system (CVA/Tailwind tooling) or tailwind-even-spacing-and-tokens
  (spacing/color token rules) — read all three for full coverage.
allowed-tools: Read, Write, Edit, Bash, Grep
model: sonnet
metadata:
  v0.kind: design-system
---

# CATS Design System

This is the canonical visual source for all CATS staff-portal features. Every
screen, component, and pattern must use the tokens, CSS classes, and conventions
defined here. Do not hardcode colours, radii, or font stacks in JSX.

## File Locations

| Asset | Path |
|---|---|
| CSS custom properties (single source of truth) | `frontend/design-system/tokens.css` |
| Tailwind v4 `@theme` mapping | `frontend/design-system/tailwind-theme.css` |
| All reusable CSS component classes | `frontend/design-system/components.css` |
| React `Button` primitive | `frontend/ats/src/components/ui/Button.tsx` |
| React `Card` primitives | `frontend/ats/src/components/ui/card.tsx` |
| Global CSS entry (imports above) | `frontend/ats/src/index.css` |

## Always-Read Rules

1. **Token-only colours** — Never hardcode hex/rgb in JSX `className` or inline
   `style`. Use CSS variables (`var(--red)`) or the Tailwind utility equivalents
   (`text-red`, `bg-surface`, `border-line`). See `tailwind-even-spacing-and-tokens`.

2. **Red is accent, not primary chrome** — `--red` / `.btn-primary` is reserved
   for the single main CTA per view and true alerts. Do not paint navigation,
   headings, or decorative elements red.

3. **Focus ring = red ring, never default outline** — Every interactive element
   must use `box-shadow: 0 0 0 var(--ring-w) var(--red-ring)` on `:focus-visible`.
   The CSS classes below already include this. For custom elements add
   `focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-red-ring`.

4. **Buttons use `.btn` + modifier class** — For raw HTML buttons use the CSS
   classes (`.btn .btn-primary`, etc.). For React use the `Button` primitive from
   `src/components/ui/Button.tsx`. Always add `type="button"` unless explicitly
   submitting a form.

5. **Destructive actions are two-step** — Every destructive action (delete, revoke,
   reject) must use the two-step confirmation modal pattern (section 11 of
   `components.css`). Never present a single confirm button for irreversible actions.

6. **Mono type for metadata** — IDs, timestamps, counts, code, table headers, badge
   labels, eyebrows, and nav-group labels use `font-family: var(--mono)`. Body copy
   and UI labels use `font-family: var(--sans)`.

7. **App shell is fixed sidebar + sticky topbar** — Use `.app → .sidebar +
   .app-main → .topbar + .app-content` structure. Do not float or position the
   sidebar yourself. It collapses to a drawer at ≤860 px automatically.

8. **Auth layout is two-column split** — Auth screens use `.auth → .auth-aside +
   .auth-form-side`. Aside is black (`var(--ink)`), form side is white. Aside is
   hidden on mobile (≤820 px).

9. **Form labels must be associated** — Every `<input>` / `<select>` / `<textarea>`
   must have a `<label class="label">` linked via `htmlFor` + `id`. Use `<p>` for
   section headings that don't directly label a control.

10. **Even px spacing** — Use even-pixel arbitrary values only. No `gap-[11px]`,
    `py-[13px]`, etc. Prefer the Tailwind scale when it maps to an even value.
    See `tailwind-even-spacing-and-tokens`.

## Foundations

### Color Tokens

All custom properties live in `frontend/design-system/tokens.css`. The Tailwind
utilities below are registered via `tailwind-theme.css` and are ready to use in
`className`.

#### Brand

| Token | Tailwind | Hex | Usage |
|---|---|---|---|
| `--red` | `text-red` / `bg-red` / `border-red` | `#ef233c` | Primary CTA, active state indicator, error signals. ≤10% of any screen. |
| `--red-press` | `bg-red-press` | `#c81328` | Hover/active state of red buttons |
| `--red-tint` | `bg-red-tint` | `#fdeef0` | Red badge background, modal icon bg, selected row wash |
| `--red-ring` | `ring-red-ring` | `rgba(239,35,60,0.16)` | Focus ring shadow — always 3px wide |

#### Neutrals (ink → surface)

| Token | Tailwind | Hex | Usage |
|---|---|---|---|
| `--ink` | `text-ink` / `bg-ink` | `#1a1a1a` | Primary text, headings, sidebar background |
| `--ink-2` | `text-ink-2` | `#52525b` | Secondary text, button labels, avatar initials |
| `--ink-3` | `text-ink-3` | `#71717a` | Captions, placeholders, muted copy |
| `--ink-4` | `text-ink-4` | `#a1a1aa` | Disabled text, placeholder text |
| `--line` | `border-line` | `#e4e4e7` | Card borders, input borders, dividers |
| `--line-2` | `border-line-2` | `#f0f0f2` | Hairline table row separators |
| `--surface` | `bg-surface` | `#f7f7f8` | Page background, disabled input bg, row hover |
| `--surface-2` | `bg-surface-2` | `#fbfbfc` | Table header bg, modal footer bg |
| `--white` | `bg-cats-white` | `#ffffff` | Cards, inputs, modal body |
| `--black` | `bg-cats-black` | `#030303` | Auth aside background |

#### Status

| Token | Tailwind | Usage |
|---|---|---|
| `--success` / `--success-tint` / `--success-line` | `text-success` / `bg-success-tint` / `border-success-line` | Active, approved, hired |
| `--warning` / `--warning-tint` / `--warning-line` | `text-warning` / `bg-warning-tint` / `border-warning-line` | Pending, needs attention |
| `--info` / `--info-tint` / `--info-line` | `text-info` / `bg-info-tint` / `border-info-line` | Informational, invited |
| `--neutral` / `--neutral-tint` / `--neutral-line` | `text-neutral` / `bg-neutral-tint` / `border-neutral-line` | Inherited state, deactivated |

#### Avatar Backgrounds (never red)

`--av-1` through `--av-5` map to `bg-av-1` … `bg-av-5`. Pick one by user index
mod 5. Text always uses `--av-ink` (`text-av-ink`).

### Typography

Fonts are loaded via `@fontsource` in `frontend/ats/src/index.css`.

| Stack | Variable | Tailwind | Weights |
|---|---|---|---|
| DM Sans | `var(--sans)` | `font-sans` | 400 · 500 · 600 · 700 |
| JetBrains Mono | `var(--mono)` | `font-mono` | 400 · 500 · 600 |

#### CSS helper classes (from `components.css`)

Apply these directly in `className` — they wire the correct size, weight,
leading, and tracking:

| Class | Size / Weight | Usage |
|---|---|---|
| `.h1` | 28px / 600, tracking −0.02em | Page titles |
| `.h2` | 20px / 600, tracking −0.015em | Section headings, modal titles |
| `.h3` | 15px / 600, tracking −0.01em | Card sub-headings |
| `.text` | 14px / 400, lh 1.55 | Body copy |
| `.text-muted` | inherits / `var(--ink-3)` | Secondary body copy |
| `.small` | 12.5px / 400, `var(--ink-3)` | Captions, hints, timestamps |
| `.eyebrow` | 11.5px mono, 500, uppercase, tracked | Page kicker / section label |
| `.mono` | 12.5px mono, `var(--ink-2)` | IDs, codes, metadata values |

### Borders & Radius

| Context | Token | Tailwind | Value |
|---|---|---|---|
| Cards | `--r-card` | `rounded-card` | 14px |
| Larger cards / modals | `--r-card-lg` | `rounded-card-lg` | 16px |
| Buttons | `--r-btn` | `rounded-btn` | 8px |
| Inputs | `--r-field` | same as `rounded-btn` | 8px |
| Pills / badges / switch track | `--r-pill` | `rounded-pill` | 999px |

### Shadows

| Token | Tailwind | Usage |
|---|---|---|
| `--sh-1` | `shadow-sh-1` | Cards, stat boxes, default surface lift |
| `--sh-2` | `shadow-sh-2` | Popovers, dropdowns, elevated panels |

### Transitions

Use the shared easing variables in custom CSS:

```css
transition: background-color var(--dur) var(--ease);  /* 180ms ease */
transition: background-color var(--dur-fast) var(--ease);  /* 120ms — hover feedback */
```

---

## Components

### Buttons

CSS classes (use for raw HTML; React primitive wraps these):

```html
<!-- Primary — one per view, main CTA -->
<button class="btn btn-primary" type="submit">Approve</button>

<!-- Secondary — dark near-black, non-accent primary action -->
<button class="btn btn-secondary" type="button">Save Draft</button>

<!-- Tertiary — white outline, neutral secondary action -->
<button class="btn btn-tertiary" type="button">Cancel</button>

<!-- Quiet — text only, toolbar / low-emphasis -->
<button class="btn btn-quiet" type="button">View Details</button>

<!-- Destructive — outlined red, fills red on hover (red stays scarce) -->
<button class="btn btn-destructive" type="button">Revoke Access</button>

<!-- Small modifier — 32px height -->
<button class="btn btn-tertiary btn-sm" type="button">Edit</button>

<!-- Full-width -->
<button class="btn btn-primary btn-block" type="submit">Continue</button>
```

React `Button` primitive (prefer for all new JSX):

```tsx
import { Button } from '#/components/ui/Button';

<Button type="submit">Approve</Button>
<Button variant="outline" type="button">Cancel</Button>
<Button variant="destructive" type="button">Revoke</Button>
<Button size="sm" type="button">Edit</Button>
```

**Google sign-in button** — Use `.btn-google` for auth screens. The multicolour
Google "G" mark is the only colour on the button:

```html
<button class="btn-google" type="button">
  <img class="g-mark" src="/google-mark.svg" alt="" />
  Sign in with Google
</button>
```

### Form Fields

Always wrap label + input in `.field`. Labels use `.label`; required asterisks use `.label .req`.

```html
<div class="field">
  <label class="label" for="email">
    Email <span class="req">*</span>
  </label>
  <input class="input" id="email" type="email" placeholder="you@cogentlabs.co" />
  <!-- Error state -->
  <input class="input input-error" id="email" type="email" />
  <span class="field-error">Enter a valid email address.</span>
  <!-- Hint -->
  <span class="field-hint">Must be your @cogentlabs.co address.</span>
</div>

<!-- Textarea -->
<div class="field">
  <label class="label" for="notes">Notes</label>
  <textarea class="textarea" id="notes"></textarea>
</div>

<!-- Select -->
<div class="field">
  <label class="label" for="role">Role</label>
  <select class="select" id="role">
    <option>Recruiter</option>
  </select>
</div>

<!-- Search with icon -->
<div class="search">
  <svg class="search-icon">…</svg>
  <input class="input" type="search" placeholder="Search candidates…" />
</div>
```

**Focus state** (already in `.input` / `.select` / `.textarea`):
`border-color: var(--red); box-shadow: 0 0 0 3px var(--red-ring)`

**Toggle switch:**

```html
<label class="switch">
  <input type="checkbox" />
  <span class="track"></span>
  <span class="thumb"></span>
</label>
```

### Badges / Status Pills

Mono-font pill. Use `.dot` inside for a leading status dot.

```html
<span class="badge badge-success"><span class="dot"></span>Active</span>
<span class="badge badge-warning"><span class="dot"></span>Pending</span>
<span class="badge badge-info">Invited</span>
<span class="badge badge-neutral">Deactivated</span>
<!-- Red: true alerts only -->
<span class="badge badge-red">Blacklisted</span>
```

### Tristate Permission Control

The segmented Inherit / Grant / Revoke control for the RBAC permission editor:

```html
<div class="tristate" role="group" aria-label="Access">
  <button class="seg-inherit" aria-pressed="true" type="button">Inherit</button>
  <button class="seg-grant"   aria-pressed="false" type="button">Grant</button>
  <button class="seg-revoke"  aria-pressed="false" type="button">Revoke</button>
</div>
```

Active segment colour:
- `seg-inherit` pressed → white card lift
- `seg-grant` pressed → success tint + success border
- `seg-revoke` pressed → red tint + red border

### Tables

```html
<div class="table-wrap">
  <table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Role</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Aisha Khan</td>
        <td>TA Lead</td>
        <td><span class="badge badge-success"><span class="dot"></span>Active</span></td>
      </tr>
      <!-- Selected row -->
      <tr class="is-selected">…</tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3">
          <span class="table-count">24 users</span>
        </td>
      </tr>
    </tfoot>
  </table>
</div>
```

### Cards

```html
<!-- Standard card -->
<div class="card">
  <div class="card-header">
    <span class="h3">Card Title</span>
    <button class="btn btn-tertiary btn-sm" type="button">Edit</button>
  </div>
  <!-- body content -->
</div>

<!-- Larger card (16px radius) -->
<div class="card card-lg">…</div>
```

React `Card` primitives (from `src/components/ui/card.tsx`):

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '#/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
  <CardFooter>…</CardFooter>
</Card>
```

### Stat Cards

```html
<div class="stat">
  <div class="stat-label">Active Jobs</div>
  <div class="stat-value">12</div>
  <div class="stat-desc">3 closing this week</div>
</div>

<!-- Red accent on value (signal usage only) -->
<div class="stat stat-accent">
  <div class="stat-label">Pending Approvals</div>
  <div class="stat-value">5</div>
</div>
```

### Avatars

```html
<!-- 28px, 36px, 48px sizes -->
<span class="avatar avatar-sm av-1">AK</span>
<span class="avatar avatar-md av-3">RZ</span>
<span class="avatar avatar-lg av-5">SP</span>
```

Pick background by `(userIndex % 5) + 1`. Text always `var(--av-ink)`.

---

## Patterns

### App Shell

```
.app (grid: sidebar-w + 1fr)
├── .sidebar (fixed, dark #1a1a1a)
│   ├── .sidebar-brand
│   │   └── .brand-lockup → .brand-mark (red square, "CA") + .brand-name "CATS"
│   ├── .sidebar-nav
│   │   └── .nav-group
│   │       ├── .nav-group-label  (mono uppercase)
│   │       └── .nav-item [.is-active]  (red left border when active)
│   └── .sidebar-footer  (avatar + name + role)
└── .app-main (column 2)
    ├── .topbar (sticky, white, border-bottom)
    │   ├── .breadcrumb (mono)
    │   └── .topbar-actions → .icon-btn* + .avatar
    └── .app-content (padding 28px 24px, max-width: var(--content-max))
```

Responsive: at ≤860 px the sidebar slides off screen. Show `.nav-toggle` button
in the topbar. Toggle `.nav-open` on `.app` to open. Add `.scrim` overlay.

### Auth Split Layout

```
.auth (grid: 1.05fr + 1fr, full-height)
├── .auth-aside (black bg, flex column, padding 48px)
│   ├── Brand lockup (top)
│   ├── Hero copy / animated preview (middle, flex-1)
│   └── Footer copy (bottom)
└── .auth-form-side (white, centered)
    └── .auth-form (max-width 380px)
        ├── Title (.h1) + description (.text-muted)
        └── .btn-google  ← only action on staff login
```

Aside is hidden on mobile (≤820 px). Form side becomes full-viewport.

### Two-Step Confirmation Modal

Required for all destructive actions per NFR-UX-01 (PRD).

```html
<div class="modal-overlay">
  <div class="modal" id="confirm-modal">

    <!-- Step 1 -->
    <div class="modal-body step-1">
      <div class="modal-icon">
        <svg class="icon">…</svg>
      </div>
      <h2 class="modal-title">Revoke Access?</h2>
      <p class="modal-text">
        This will immediately end the user's session and remove all permissions.
      </p>
    </div>
    <div class="modal-footer step-1">
      <button class="btn btn-tertiary btn-sm" type="button" onclick="close()">Cancel</button>
      <button class="btn btn-destructive btn-sm" type="button" onclick="goStep2()">Revoke Access</button>
    </div>

    <!-- Step 2 (add .is-step-2 to .modal to show) -->
    <div class="modal-body step-2">
      <div class="modal-step-meta">Step 2 of 2 — Final Confirmation</div>
      <h2 class="modal-title">Are you sure?</h2>
      <p class="modal-text">This action cannot be undone.</p>
      <div class="modal-confirm-row">
        <!-- Optional: type-to-confirm input -->
        <div class="field">
          <label class="label" for="confirm-text">Type REVOKE to confirm</label>
          <input class="input" id="confirm-text" placeholder="REVOKE" />
        </div>
      </div>
    </div>
    <div class="modal-footer step-2">
      <button class="btn btn-tertiary btn-sm" type="button" onclick="close()">Cancel</button>
      <button class="btn btn-primary btn-sm" type="button" onclick="confirm()">Confirm Revoke</button>
    </div>

  </div>
</div>
```

To open step 2: `document.getElementById('confirm-modal').classList.add('is-step-2')`.

### Permission Editor Row

Combines a table row + tristate control for the RBAC permission editor:

```html
<tr>
  <td>
    <span class="h3">kanban.manage</span><br>
    <span class="small">Manage kanban pipeline</span>
  </td>
  <td>
    <div class="tristate" role="group">
      <button class="seg-inherit" aria-pressed="true" type="button">Inherit</button>
      <button class="seg-grant" aria-pressed="false" type="button">Grant</button>
      <button class="seg-revoke" aria-pressed="false" type="button">Revoke</button>
    </div>
  </td>
</tr>
```

---

## Pipeline

- Depends on: `tailwind-even-spacing-and-tokens` (token colour + spacing rules)
- Depends on: `styling-system` (CVA variants, `cn()` helper, file placement)
- Related: `accessibility` (ARIA, keyboard, focus management)
- Related: `component-architecture` (component structure, file conventions)

---

## Final Checks Before Submitting

- [ ] No hardcoded hex/rgb/hsl in JSX `className` or `style={{}}`
- [ ] No odd-pixel arbitrary spacing (`gap-[11px]`, `py-[13px]`, etc.)
- [ ] Red used only for primary CTA and true error/alert signals (≤10% of screen)
- [ ] All interactive elements have red focus ring (`0 0 0 3px var(--red-ring)`)
- [ ] Buttons have explicit `type="button"` (or `type="submit"` for form submits)
- [ ] Destructive actions use the two-step modal pattern
- [ ] Every input has an associated `<label class="label">` with `htmlFor` / `id`
- [ ] Section headings without controls use `<p>`, not `<label>`
- [ ] Metadata / IDs / counts use `font-mono` or `.mono` / `.eyebrow`
- [ ] Avatar backgrounds use `av-1`…`av-5`, never red
- [ ] App shell uses `.app → .sidebar + .app-main` structure
- [ ] Auth screens use `.auth → .auth-aside + .auth-form-side` structure
- [ ] `@media (prefers-reduced-motion: reduce)` is not broken by new animations
