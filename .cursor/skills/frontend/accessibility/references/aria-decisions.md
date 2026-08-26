# Decisions

## Choose native HTML or ARIA

| Need | Prefer | Use ARIA when |
| --- | --- | --- |
| Button-like action | `<button>` | A custom surface truly cannot be a button |
| Navigation | `<a href>` | The control is not navigation and should be a button instead |
| Disclosure | Native button + hidden region | You need `aria-expanded` and `aria-controls` to expose state |
| Status update | Visible text only | The update appears after interaction and must be announced |

## Choose a naming pattern

- Use `aria-labelledby` when visible text already exists and should stay the spoken name.
- Use `aria-label` for icon-only or very compact controls that have no visible name.
- Avoid combining multiple sources of truth that can drift apart.

## Choose a live-region strategy

- Use `polite` for confirmations, inline validation, and non-blocking progress.
- Use `assertive` sparingly for critical failures or interruptions.
- Prefer not announcing at all when the change is already obvious from focus movement or visible content directly under the user's cursor.
