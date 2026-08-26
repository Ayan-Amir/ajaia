---
name: tailwind-even-spacing-and-tokens
description: >-
  Tailwind class rules for frontend UI: use even pixel spacing (10px, 12px, not 11px)
  and semantic color utilities from the design system, never hardcoded hex/rgb.
  Use when writing or reviewing className, Tailwind utilities, candidate login,
  career-frontend, or any React styling in this repo.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Tailwind: even spacing and token colors

## Rules (non-negotiable)

1. **Even spacing only** — Prefer **10px** and **12px** (and other **even** steps: 8, 14, 16, 20, 24…). **Do not** use odd arbitrary spacing such as **11px**, **13px**, **15px**, **17px**, **21px**, **23px** in `className` unless there is no even alternative and the user explicitly requires a design-spec odd value.

2. **Token colors only** — Use CATS Tailwind utilities from `design-system/tailwind-theme.css` (`text-ink`, `bg-red`, `border-line`, `shadow-sh-1`, `rounded-card-lg`, etc.). **Do not** hardcode colors in components: no `#ef233c`, no `rgb()`, no `text-[#71717a]`, no `bg-[#ffffff]` when a token utility exists.

For fonts, radii, and shadows, prefer theme utilities and CSS variables from `design-system/tokens.css` over one-off literals.

## When to apply

- New or edited `className` on React components (`frontend/`, `career-frontend/`)
- Replacing legacy CSS with Tailwind
- PR review of UI diffs
- Fixing layout that used arbitrary `-[11px]` / `-[13px]` / hex colors

Pair with `styling-system` for CVA, `cn()`, and file placement. Pair with workspace rule `cats-design-system` for brand law.

## Spacing: map odd values to even

| Avoid | Prefer |
|-------|--------|
| `gap-[11px]`, `py-[11px]`, `px-[7px]` | `gap-2.5` (10px), `gap-3` (12px), `py-2.5`, `py-3`, `px-2` (8px) or `px-3` (12px) |
| `mt-0.75` (3px) | `mt-1` (4px) or `mt-0.5` (2px) |
| `text-[11px]`, `text-[10.5px]`, `text-[9.5px]` | `text-xs` (12px) or `text-[10px]` / `text-[12px]`; labels: `text-[12px]` + `font-mono` + tracking per design |
| `w-[15px] h-[15px]` icons | `w-4 h-4` (16px) |
| `mb-[22px]` | `mb-5` (20px) or `mb-6` (24px) |
| `gap-[26px]` | `gap-6` (24px) or `gap-7` (28px) |

Use the **default Tailwind spacing scale** when it lands on an even pixel value in your target breakpoint. Use **even** arbitrary values only when the scale has no close match: `gap-[10px]`, `p-[12px]`, `max-w-[400px]` (400 is fine; 401 is not).

## Colors: map literals to tokens

| Avoid | Prefer |
|-------|--------|
| `text-[#1a1a1a]`, `text-gray-600` | `text-ink`, `text-ink-2`, `text-ink-3`, `text-ink-4` |
| `bg-white` for CATS surfaces (when matching design system) | `bg-cats-white` or `bg-surface` / `bg-surface-2` |
| `border-gray-200` | `border-line`, `border-line-2` |
| `text-red-600`, `#ef233c` | `text-red`, `bg-red`, `border-red`, `hover:bg-red-press` |
| `ring-red-500/20` | `ring-red-ring` or `focus-visible:ring-red-ring` |
| `shadow-sm` when design uses CATS shadow | `shadow-sh-1`, `shadow-sh-2` |
| `rounded-lg` when card radius is specified | `rounded-card`, `rounded-card-lg`, `rounded-btn` |

**Allowed:** `color-mix(in srgb, var(--red) …)` in arbitrary values when the HTML spec uses a tint and no single utility exists—still reference **`var(--red)`**, **`var(--white)`**, **`var(--line)`**, not hex.

**Not allowed in JSX `className`:** shadcn-only colors for **new** CATS screens unless remapping is explicitly in scope.

## Examples

```tsx
// Bad
<div className="gap-[11px] text-[11px] text-[#71717a] border-[#e4e4e7]" />

// Good
<div className="gap-3 text-xs text-ink-3 border-line" />
```

```tsx
// Bad
<span className="px-[7px] h-[18px] text-[9.5px] bg-[#eaf1f8]" />

// Good
<span className="px-2 h-4 text-[10px] bg-info-tint" />
```

## Review checklist

- [ ] No odd px in `-[Npx]` for margin, padding, gap, width, height (except full design lock-in with user approval)
- [ ] No hex/rgb/hsl color literals in `className`
- [ ] Ink, line, surface, red, status, and avatar colors use CATS utilities
- [ ] Typography sizes snapped to even px or existing token (`text-sm`, `eyebrow` / `h1` from `components.css` where appropriate)
