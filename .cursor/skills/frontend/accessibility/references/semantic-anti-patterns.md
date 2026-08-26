# Anti-Patterns

| Anti-pattern | Why it fails | Better pattern |
| --- | --- | --- |
| Clickable `div` or `span` for actions | No default role, key support, or button behavior | Use a real `<button>` |
| Headings chosen for font size only | The outline stops matching the document meaning | Use CSS for size and keep semantic heading levels |
| Layout tables for page structure | Screen readers announce a fake table relationship | Use semantic layout elements and CSS |
| Fake lists built from line breaks | Users do not get list count or structure | Use `ul`, `ol`, or `dl` |
| `section` without a heading | The region has weak navigational value | Add a heading or use a simpler container |
