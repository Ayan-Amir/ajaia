---
name: accessibility
description: "Use this skill when any task involves making UI components, pages, or 
interactive elements accessible. Covers semantic HTML element selection, ARIA roles and 
attributes, keyboard navigation patterns, focus management for dynamic UI, and accessible 
form implementation. Use for tasks like: choosing correct HTML elements, adding ARIA 
labels to interactive components, ensuring keyboard-only navigability, managing focus 
after modal open/close or route transitions, and making form validation errors accessible. 
NOT for visual styling of accessible states (styling-system), form implementation logic 
beyond accessibility concerns (forms-validation), or error boundary patterns 
(error-boundaries)."
allowed-tools: Read, Write, Edit
model: claude-sonnet-4-20250514
---

# Accessibility

## Sub-Skill Selection

Read the task and load the relevant reference file — do not load all references.

| Task involves | Reference to load |
|---|---|
| Choosing correct HTML elements over generic divs/spans | references/semantic-patterns.md |
| ARIA roles, aria-label, aria-describedby, aria-expanded | references/aria-patterns.md |
| Tab order, keyboard shortcuts, keyboard-only interaction | references/keyboard-patterns.md |
| Focus after modal open/close, route change, dynamic content | references/focus-patterns.md |
| Input labels, validation error accessibility, accessible fields | references/forms-patterns.md |

## When Multiple Apply
Load references in this order:
1. references/semantic-patterns.md (structure first)
2. references/aria-patterns.md (enhance structure)
3. references/keyboard-patterns.md (ensure navigability)
4. references/focus-patterns.md (manage dynamic focus)
5. references/forms-patterns.md (if a form is involved)

## Anti-Pattern References
Load these only when reviewing or fixing existing code:
- references/semantic-anti-patterns.md
- references/keyboard-anti-patterns.md
- references/forms-anti-patterns.md
