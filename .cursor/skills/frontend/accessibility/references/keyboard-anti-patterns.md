# Anti-Patterns

| Anti-pattern | Why it fails | Better pattern |
| --- | --- | --- |
| `outline: none` with no replacement | Users lose their only location cue | Keep the outline or add a clear `:focus-visible` style |
| Positive `tabindex` values | Focus order becomes fragile and hard to predict | Use native DOM order and `tabindex="0"` only when needed |
| Clickable `div` without key handlers | Pointer users can act but keyboard users cannot | Use a real button, or add focus plus Enter and Space support |
| Focus trap with no exit | Users become stuck in the component | Support `Escape` where expected and preserve a way out |
| Arrow-key widget with every item tabbable | The widget becomes noisy and slow to navigate | Use one tab stop and roving `tabindex` inside |
