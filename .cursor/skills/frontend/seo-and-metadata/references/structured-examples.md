# Examples

## Organization and WebSite

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.example.com/#org",
        "name": "Acme",
        "url": "https://www.example.com/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.example.com/static/logo.png"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://www.example.com/#website",
        "url": "https://www.example.com/",
        "name": "Acme",
        "publisher": { "@id": "https://www.example.com/#org" }
      }
    ]
  }
</script>
```

## Article

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How we ship faster releases",
    "datePublished": "2026-04-01T08:00:00+00:00",
    "dateModified": "2026-04-05T10:15:00+00:00",
    "author": { "@type": "Person", "name": "Jane Doe" },
    "publisher": { "@id": "https://www.example.com/#org" },
    "image": ["https://www.example.com/media/hero.jpg"],
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://www.example.com/blog/releases" }
  }
</script>
```

## Product

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Acme Pro Plan",
    "description": "Team features and SSO.",
    "sku": "pro-annual",
    "brand": { "@type": "Brand", "name": "Acme" },
    "image": ["https://www.example.com/static/pro.png"],
    "offers": {
      "@type": "Offer",
      "url": "https://www.example.com/pricing",
      "priceCurrency": "USD",
      "price": "99.00",
      "availability": "https://schema.org/InStock"
    }
  }
</script>
```

## Inject JSON-LD from JS

```javascript
function setJsonLd(id, data) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}
```
