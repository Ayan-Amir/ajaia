---
name: seo-and-metadata
description: "Use this skill when any task involves page metadata, search engine 
optimization, or link preview configuration. Covers dynamic meta tag management, 
structured data markup, and social sharing metadata. Use for tasks like: setting page 
titles and descriptions dynamically, implementing JSON-LD schema markup, adding 
OpenGraph and Twitter card tags for link previews. NOT for routing or navigation logic 
(routing-navigation), component-level rendering performance (performance-optimization), 
or server-side rendering configuration beyond metadata scope."
allowed-tools: Read, Write, Edit
model: claude-sonnet-4-20250514
---

# SEO & Metadata

## Sub-Skill Selection

Read the task and load the relevant reference file — do not load all references.

| Task involves | Reference to load |
|---|---|
| Page title, meta description, canonical tags, dynamic head | references/meta-patterns.md |
| JSON-LD, schema.org markup, rich results | references/structured-patterns.md |
| og:title, og:image, twitter:card, link preview tags | references/social-patterns.md |

## When Multiple Apply
Load references in this order:
1. references/meta-patterns.md (base tags first)
2. references/structured-patterns.md (semantic layer)
3. references/social-patterns.md (sharing layer)

## Decision & Troubleshooting References
Load these only when needed:
- references/meta-decisions.md
- references/meta-examples.md
- references/structured-decisions.md
- references/structured-troubleshooting.md
- references/social-troubleshooting.md
- references/social-examples.md
- references/structured-examples.md
