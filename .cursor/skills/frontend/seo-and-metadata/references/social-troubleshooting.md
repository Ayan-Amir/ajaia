# Troubleshooting

## Preview is stale

- Re-run the target URL through a platform debugger or inspector to refresh cached metadata.
- Confirm the deployed page really serves the new tags before assuming the platform cache is wrong.

## Image does not appear

- Verify the image URL is absolute, public, and reachable without authentication.
- Check that the asset is not blocked by `robots.txt` or a CDN policy.
- Confirm the file is large enough and not an unsupported format for the target platform.

## Wrong title or description appears

- Check for duplicate OG or Twitter tags in the rendered head.
- Make sure the route-level source of truth wins over shared defaults.
- Confirm the platform is not falling back to stale Open Graph values because Twitter-specific tags are missing or empty.
