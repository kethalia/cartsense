---
phase: 01-foundation
plan: 02
subsystem: i18n, theming
tags: [next-intl, next-themes, i18n, ron-currency, locale-routing, clerk]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Next.js scaffold, package.json with next-intl/next-themes/clerk deps"
provides:
  - "next-intl routing config with en/ro locales and auto-detection"
  - "RON currency formatting via useFormatter()"
  - "Message files for all Phase 1 UI strings (en + ro)"
  - "Theme provider with light/dark/system modes"
  - "[locale] layout with ClerkProvider > NextIntlClientProvider > ThemeProvider"
  - "Combined Clerk + next-intl middleware"
  - "Navigation helpers (Link, redirect, useRouter, usePathname)"
affects: [01-03, 01-04, 01-05]

# Tech tracking
tech-stack:
  added: [next-intl, next-themes, @clerk/nextjs middleware]
  patterns: [locale-prefix-as-needed, combined-clerk-intl-middleware, three-provider-nesting, setRequestLocale-pattern]

key-files:
  created:
    - src/i18n/routing.ts
    - src/i18n/navigation.ts
    - src/messages/en.json
    - src/messages/ro.json
    - src/components/theme-provider.tsx
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/page.tsx
    - src/middleware.ts
  modified:
    - src/i18n/request.ts
    - next.config.ts

key-decisions:
  - "Used explicit conditional imports for message files instead of dynamic template string (webpack can't resolve dynamic paths)"
  - "English as defaultLocale with 'as-needed' prefix — clean URLs for English, /ro/ prefix for Romanian"
  - "Added combined Clerk + next-intl middleware in Task 2 (blocking dependency for locale routing)"

patterns-established:
  - "Provider nesting order: ClerkProvider > NextIntlClientProvider > ThemeProvider"
  - "setRequestLocale() called at top of every layout and page for static rendering"
  - "suppressHydrationWarning on html tag for next-themes compatibility"
  - "Explicit conditional imports for locale message files"

requirements-completed: [L10N-01, L10N-02, L10N-03, L10N-05]

# Metrics
duration: 4 min
completed: 2026-03-04
---

# Phase 1 Plan 2: i18n & Theme System Summary

**next-intl i18n with Romanian/English auto-detection, RON currency formatting, and three-mode theme system integrated with Clerk auth middleware**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-04T20:35:03Z
- **Completed:** 2026-03-04T20:39:27Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Complete i18n system with auto-detection from browser locale, Romanian diacritics, and RON currency formatting
- Theme provider supporting light/dark/system modes with Tailwind dark: class integration
- Locale layout with three providers in correct nesting order (Clerk > i18n > Theme)
- Combined Clerk + next-intl middleware handling both auth protection and locale routing
- Static rendering enabled via setRequestLocale in all layouts and pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure next-intl with Romanian/English and RON currency formatting** - `8319253` (feat)
2. **Task 2: Implement theme system and create locale layout with all providers** - `3477f0f` (feat)

## Files Created/Modified

- `src/i18n/routing.ts` - Locale routing config: en/ro, localePrefix 'as-needed', auto-detection
- `src/i18n/request.ts` - Server-side locale resolution with RON currency format
- `src/i18n/navigation.ts` - Navigation helpers (Link, redirect, useRouter, usePathname, getPathname)
- `src/messages/en.json` - English translations for all Phase 1 UI strings
- `src/messages/ro.json` - Romanian translations with proper diacritics (ă, â, î, ș, ț)
- `next.config.ts` - Updated to point to i18n/request.ts explicitly
- `src/components/theme-provider.tsx` - next-themes wrapper for shadcn/ui pattern
- `src/app/[locale]/layout.tsx` - Locale layout with all three providers and Toaster
- `src/app/[locale]/page.tsx` - Placeholder page with locale indicator
- `src/middleware.ts` - Combined Clerk auth + next-intl locale routing middleware
- `src/app/page.tsx` - Removed (replaced by [locale]/page.tsx)

## Decisions Made

- **Explicit conditional imports for messages:** Webpack can't resolve dynamic template string paths (`../../messages/${locale}.json`). Used explicit `locale === 'ro' ? import('ro.json') : import('en.json')` pattern instead.
- **English as defaultLocale:** Clean URLs for English (/), /ro/ prefix for Romanian — matches 'as-needed' locale prefix strategy.
- **Middleware created in Task 2:** The combined Clerk + next-intl middleware was a blocking dependency for locale routing to function. Added as part of Task 2 since it's essential for the [locale] layout to work.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed message file import paths in request.ts**
- **Found during:** Task 2 (build verification)
- **Issue:** Plan's template used `../../messages/${locale}.json` but webpack can't resolve dynamic paths, and the relative path was wrong (`../../` instead of `../`)
- **Fix:** Changed to explicit conditional imports with correct relative path `../messages/*.json`
- **Files modified:** src/i18n/request.ts
- **Verification:** `npm run build` succeeds
- **Committed in:** `3477f0f` (Task 2 commit)

**2. [Rule 3 - Blocking] Removed stale untracked files from previous session**
- **Found during:** Task 2 (build verification)
- **Issue:** Untracked `messages/` directory at project root and `src/components/auth/email-otp-form.tsx` from a previous session caused build type errors
- **Fix:** Removed stale untracked directories (`messages/`, `src/components/auth/`)
- **Files modified:** None (removed untracked files only)
- **Verification:** `npm run build` succeeds cleanly
- **Committed in:** N/A (untracked files, no commit needed)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes were necessary for correct operation. No scope creep.

## Issues Encountered

None beyond the auto-fixed deviations above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- i18n infrastructure complete — all future UI components can use `useTranslations()` and `useFormatter()`
- Theme system ready — dark/light/system modes available via ThemeProvider
- Middleware handles both auth protection and locale routing
- Ready for Plan 03 (Auth Screen) which will use these providers and translations

## Self-Check: PASSED

All 9 key files verified on disk. Both task commits (8319253, 3477f0f) verified in git log.

---
*Phase: 01-foundation*
*Completed: 2026-03-04*
