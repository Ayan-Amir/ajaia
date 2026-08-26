# Examples

## Open Graph and Twitter tags

```html
<head>
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Acme" />
  <meta property="og:title" content="How we ship faster releases" />
  <meta
    property="og:description"
    content="Practices our team uses to shorten release cycles."
  />
  <meta property="og:url" content="https://www.example.com/blog/releases" />
  <meta
    property="og:image"
    content="https://www.example.com/media/og-releases.jpg"
  />
  <meta property="og:image:alt" content="Team shipping a release" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="How we ship faster releases" />
  <meta
    name="twitter:description"
    content="Practices our team uses to shorten release cycles."
  />
  <meta
    name="twitter:image"
    content="https://www.example.com/media/og-releases.jpg"
  />
</head>
```

## Set Open Graph properties from JS

```javascript
function setOgProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function applySocialPreview({ title, description, url, imageUrl, imageAlt }) {
  setOgProperty("og:title", title);
  setOgProperty("og:description", description);
  setOgProperty("og:url", url);
  setOgProperty("og:image", imageUrl);
  if (imageAlt) setOgProperty("og:image:alt", imageAlt);
}
```

## Next.js App Router metadata

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    type: "article",
    siteName: "Acme",
    title: "How we ship faster releases",
    description: "Practices our team uses to shorten release cycles.",
    url: "https://www.example.com/blog/releases",
    images: [
      {
        url: "https://www.example.com/media/og-releases.jpg",
        alt: "Team shipping a release",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How we ship faster releases",
    description: "Practices our team uses to shorten release cycles.",
    images: ["https://www.example.com/media/og-releases.jpg"],
  },
};
```
