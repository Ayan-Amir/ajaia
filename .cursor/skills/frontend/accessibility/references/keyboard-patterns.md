# Patterns

## Baseline keys

- `Tab` and `Shift+Tab` move through interactive elements in reading order.
- `Enter` activates links and primary actions where expected.
- `Space` activates buttons and toggle controls when the focused element behaves like a button.
- `Escape` closes transient UI such as menus, dialogs, or popovers and should leave users in a sensible place.

## Visible focus

- Keep the browser outline or provide a clearly visible replacement with `:focus-visible`.
- Make sure the indicator is high contrast and remains visible against all relevant backgrounds.

## Custom controls

- Prefer native controls first.
- If a custom surface must act like a button, it needs focusability plus both Enter and Space handling.
- If a custom widget has internal options, make one tab stop into the widget and then manage arrows inside it.

## Composite widgets

- Use roving `tabindex` for tabs, menus, listboxes, grids, and similar composite controls.
- Follow established widget expectations rather than inventing new key maps.

## Page-level bypass

- Provide a skip-link or equivalent landmark strategy on navigation-heavy pages so users can bypass repeated chrome quickly.
