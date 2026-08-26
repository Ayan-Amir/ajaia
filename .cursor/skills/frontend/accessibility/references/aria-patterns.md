# Patterns

## Native first

- Prefer native HTML semantics before adding ARIA. Native buttons, links, inputs, and landmarks usually give the cleanest accessibility tree.
- Treat ARIA as a patch for gaps in native semantics, not a replacement for the DOM.

## Accessible names and descriptions

- Use visible text as the source of truth when possible.
- Use `aria-labelledby` when the label already exists elsewhere in the DOM.
- Use `aria-label` only when no visible label can exist.
- Use `aria-describedby` for help text, supporting context, or error descriptions that should follow the name.

## State and relationship attributes

- Use `aria-expanded` on the trigger that opens or closes content.
- Use `aria-controls` only when the relationship is real and stable.
- Use `aria-pressed`, `aria-selected`, `aria-checked`, and `aria-busy` only when the underlying interaction model truly matches those states.

## Live regions

- Keep live-region containers stable in the DOM so screen readers do not lose track of them.
- Use `aria-live="polite"` for status updates that can wait.
- Use `aria-live="assertive"` only for urgent interruptions such as blocking errors.
- Keep the announced copy brief and avoid repeating the same message in visible text and a live region unless that duplication is intentional.
