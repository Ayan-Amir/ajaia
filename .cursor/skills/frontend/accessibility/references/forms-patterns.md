# Patterns

## Labels and grouping

- Every control needs a visible `<label>` tied to a stable `id`, or a reliable `aria-labelledby` path when the visual label lives elsewhere.
- Related controls such as radio groups, checkbox sets, and address blocks should use `<fieldset>` and `<legend>` when possible.
- If `fieldset` is not viable, use `role="group"` with `aria-labelledby` so the group name is still announced.

## Hints and required state

- Mark required inputs both visually and programmatically with `required` or `aria-required="true"` when the native attribute is not available.
- Attach hint text with `aria-describedby` so help text is announced after the label.
- Keep required markers and helper text persistent while the field is available; do not rely on hover-only or color-only explanation.

## Error handling

- Set `aria-invalid="true"` only while a field is actually invalid, and remove it when the error resolves.
- Reuse `aria-describedby` to connect the field to hint text and error text in one ordered list of ids.
- For long forms, combine inline errors with a form-level summary that links to the first invalid field or moves focus there after submit.

## Input and submit behavior

- Use the correct input `type`, `name`, and `autocomplete` token whenever the browser supports them.
- Keep submit controls reachable, and communicate async submit state with visible copy plus `aria-busy` or a related state when appropriate.
- Custom selects and comboboxes should still preserve announcement, selection, and typeahead behavior expected by assistive tech.
