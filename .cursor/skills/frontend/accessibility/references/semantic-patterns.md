# Patterns

## Native elements first

- Use the native element that already matches the content meaning before reaching for ARIA.
- Treat structure and meaning as the source of truth; styling comes later.

## Headings and landmarks

- Keep one clear `h1` per page or document surface.
- Use headings in order so users can skim and navigate the document outline.
- Use `main`, `nav`, `header`, `footer`, `aside`, `section`, and `article` according to the content's actual role.

## Lists, tables, and media

- Use `ul`, `ol`, or `dl` for real lists.
- Use `table`, `caption`, `th`, and `scope` for tabular data, not layout.
- Use `figure` and `figcaption` when media needs a visible caption relationship.

## Interactive controls

- Use buttons for actions and links for navigation.
- Use `label` with form controls instead of generic wrappers.
- Use `dialog` or a dialog-pattern container only when the UI behaves like a modal or non-modal dialog.
