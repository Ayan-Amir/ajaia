# Decisions

| Situation | Prefer |
| --- | --- |
| Fix vs disable rule | Fix code or adjust shared ESLint config with explicit user approval |
| `yarn lint` vs file-only `eslint` | `yarn lint` for CI parity; targeted `npx` only for faster iteration on known paths |
| Prettier write vs check | `--write` while editing; `--check` in CI or when verifying without mutation |
