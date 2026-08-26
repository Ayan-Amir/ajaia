# Examples

## Minimal static head

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Product pricing · Acme</title>
  <meta
    name="description"
    content="Compare Acme plans and pricing. Free trial available."
  />
  <link rel="canonical" href="https://www.example.com/pricing" />
</head>
```

## Client route change

```javascript
function setPageMeta({ title, description, canonicalHref }) {
  document.title = title;
  setMetaByName("description", description);
  setLinkByRel("canonical", canonicalHref);
}

function setMetaByName(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLinkByRel(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}
```

## Next.js App Router metadata

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing · Acme",
  description: "Compare Acme plans and pricing.",
  alternates: { canonical: "https://www.example.com/pricing" },
  robots: { index: true, follow: true },
};
```
