# Anti-Patterns

| Anti-pattern | Why it fails | Better pattern |
| --- | --- | --- |
| Placeholder text as the only label | The accessible name disappears once users type and is easy to miss | Keep a visible label tied to the control |
| Error styling with color alone | Users may not perceive the state or know how to fix it | Show text errors and tie them to the field |
| Detached error summary with no focus or links | Users hear a failure but cannot find the broken fields | Link to invalid fields or move focus to the first one |
| Hidden text still referenced by `aria-describedby` | Screen readers may reference missing or confusing content | Remove the id reference or keep the text available |
| Async submit with a disabled button and no status copy | Users cannot tell whether the form is working, stuck, or done | Pair disabled or busy states with visible status text |
