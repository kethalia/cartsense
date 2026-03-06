---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - biome.json
  - .github/workflows/ci.yml
autonomous: true
must_haves:
  truths:
    - "Biome is installed and configured for format checking"
    - "CI workflow runs lint, format, typecheck, and build on every PR"
    - "All four checks pass on the current codebase"
  artifacts:
    - path: "biome.json"
      provides: "Biome formatter configuration"
    - path: ".github/workflows/ci.yml"
      provides: "GitHub Actions CI pipeline"
    - path: "package.json"
      provides: "format:check and typecheck scripts"
  key_links:
    - from: ".github/workflows/ci.yml"
      to: "package.json scripts"
      via: "pnpm run lint, pnpm run format:check, pnpm run typecheck, pnpm run build"
---

<objective>
Set up basic CI checks for the CartSense repo: ESLint linting, Biome formatting, TypeScript type checking, and Next.js build — all running automatically on every pull request.

Purpose: Keep the repo structured and catch issues before merge.
Output: Working GitHub Actions CI pipeline with all four checks passing.
</objective>

<context>
@.planning/STATE.md

Project uses:
- pnpm (packageManager: pnpm@10.30.3)
- Next.js 16 + TypeScript 5.9
- ESLint 9 with next/core-web-vitals + next/typescript (eslint.config.mjs)
- Existing scripts: "lint": "eslint .", "build": "next build"
- No Biome or GitHub Actions currently configured
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Biome and add CI scripts</name>
  <files>package.json, biome.json</files>
  <action>
1. Install Biome as dev dependency:
   `pnpm add -D @biomejs/biome`

2. Create `biome.json` at project root with:
   - `$schema` pointing to biome's schema
   - `formatter.enabled: true`, `formatter.indentStyle: "space"`, `formatter.indentWidth: 2`
   - `javascript.formatter.quoteStyle: "double"`, `javascript.formatter.semicolons: "asNeeded"`
   - `linter.enabled: false` (ESLint handles linting, Biome only for formatting)
   - `organizeImports.enabled: false` (avoid conflicts with ESLint)
   - `files.ignore` for `node_modules`, `.next`, `prisma/migrations`, `pnpm-lock.yaml`

3. Add scripts to package.json:
   - `"format:check": "biome check --formatter-enabled=true --linter-enabled=false --organize-imports-enabled=false ."`
   - `"format": "biome check --formatter-enabled=true --linter-enabled=false --organize-imports-enabled=false --write ."`
   - `"typecheck": "tsc --noEmit"`

4. Run `pnpm run format:check` to see if it passes. If there are format issues, run `pnpm run format` to auto-fix them so CI will pass on the current codebase.

5. Run `pnpm run typecheck` to verify it works. If there are type errors, note them but do not fix — the CI should reflect the real state.
  </action>
  <verify>
    `pnpm run format:check` exits 0 (after formatting if needed)
    `pnpm run typecheck` runs without crashing (may have pre-existing errors)
    `pnpm run lint` still works
  </verify>
  <done>Biome installed, configured for format-only checks, scripts added, format:check passes on codebase</done>
</task>

<task type="auto">
  <name>Task 2: Create GitHub Actions CI workflow</name>
  <files>.github/workflows/ci.yml</files>
  <action>
1. Create `.github/workflows/ci.yml` with:
   - Name: "CI"
   - Triggers: `pull_request` (branches: [main]), `push` (branches: [main])
   - Single job `ci` running on `ubuntu-latest`
   - Steps:
     a. `actions/checkout@v4`
     b. Install pnpm: `pnpm/action-setup@v4` (version from packageManager field)
     c. `actions/setup-node@v4` with `node-version: 22`, `cache: 'pnpm'`
     d. `pnpm install --frozen-lockfile`
     e. Generate Prisma client: `pnpm prisma generate` (needed for typecheck/build)
     f. Lint step: `pnpm run lint`
     g. Format check step: `pnpm run format:check`
     h. Typecheck step: `pnpm run typecheck`
     i. Build step: `pnpm run build`

   Note: Build needs env vars that may not be set in CI. Add `env` block with dummy values for non-secret build-time vars if needed (e.g., NEXT_PUBLIC_* vars). For Clerk keys, the build should still work without them since they're runtime-only. Set `SKIP_ENV_VALIDATION: 1` if the project has env validation.
  </action>
  <verify>
    `.github/workflows/ci.yml` exists and is valid YAML
    Workflow triggers on PR to main and push to main
    All four check steps are present (lint, format:check, typecheck, build)
  </verify>
  <done>CI workflow file created with lint, format, typecheck, and build checks that will run on every PR</done>
</task>

</tasks>

<verification>
- `pnpm run lint` passes
- `pnpm run format:check` passes
- `pnpm run typecheck` runs (may have pre-existing issues)
- `pnpm run build` completes
- `.github/workflows/ci.yml` exists with correct structure
</verification>

<success_criteria>
All four CI scripts are configured and the GitHub Actions workflow will trigger on PRs to main.
</success_criteria>

<output>
After completion, create `.planning/quick/1-set-up-basic-ci-checks-linter-format-bio/1-SUMMARY.md`
</output>
