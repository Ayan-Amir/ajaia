# Commands and output template

Use this file when you need exact commands or the mandatory review response shape.

## Primary verification

```bash
yarn lint
```

## Targeted autofix (example paths)

```bash
npx prettier --write "src/**/*.{js,jsx,ts,tsx}" --config ./.prettierrc
npx eslint --fix "src/**/*.{js,jsx,ts,tsx}" --config ./eslint.config.ts
```

Prefer `scripts/lint.sh` from the skill root when validating end-to-end (execute the script; do not read it for instructions).

## Mandatory review output format

Always respond using ONLY this structure. Do not deviate from this format under any circumstance.

```markdown
## Findings
- [Severity] file-path: rule-name - issue and impact

## Fix Plan
- Step 1
- Step 2

## Verification
- Command(s) run
- Result
```
