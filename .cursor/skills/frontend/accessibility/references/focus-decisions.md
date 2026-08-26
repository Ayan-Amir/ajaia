# Decisions

## Where should focus go on open

- Move focus to the first actionable control when users should act immediately.
- Move focus to the dialog container or heading when users need context before acting.
- Avoid auto-focusing deep into a long form unless the entry point is obvious and expected.

## Where should focus go on close

- Return focus to the triggering control when it still exists and remains meaningful.
- Move focus to the nearest visible successor when the trigger disappears after completion.
- Move focus to a confirmation heading or next-step action when the workflow intentionally advances.

## When not to move focus

- Do not steal focus for background refreshes, passive alerts, or content that does not require immediate action.
- Prefer a live-region announcement instead of focus movement when the update is informative rather than interactive.
