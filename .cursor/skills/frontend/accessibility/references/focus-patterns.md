# Patterns

## Dialogs and overlays

- On open, move focus to the first meaningful target inside the dialog, or to the dialog container if that gives the clearest orientation.
- While open, keep focus inside the modal and isolate the background from interaction.
- On close, return focus to the trigger or the closest meaningful successor if the trigger no longer exists.

## Route transitions

- After navigation, move focus to the main content region or a page-title wrapper that can accept programmatic focus.
- Keep `document.title` in sync so screen-reader users get both title and focus context.

## Dynamic updates

- If the focused node is removed, move focus immediately to a visible fallback rather than letting it fall back to `body`.
- Do not steal focus for passive updates that appear above the current reading position unless the user action requires an immediate response.

## `tabindex` discipline

- Use `tabindex="-1"` for programmatic focus targets only.
- Avoid scattering many hidden focus anchors without a clear ownership rule.
- Prefer native tab order over manual `tabindex` management whenever possible.
