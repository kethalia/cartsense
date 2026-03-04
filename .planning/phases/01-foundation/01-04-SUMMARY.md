---
phase: 01-foundation
plan: 04
subsystem: ui
tags: [sidebar, middleware, clerk, next-intl, next-themes, locale-switcher, theme-toggle]

# Dependency graph
requires:
  - phase: 01-02
    provides: i18n routing, navigation, message files, locale layout
  - phase: 01-03
    provides: Clerk auth integration, auth screen, email OTP, Google OAuth
provides:
  - Combined Clerk + next-intl middleware with public/protected route matchers
  - Responsive app sidebar with navigation, user profile, and logout
  - LocaleSwitcher component for instant EN/RO language switching
  - ThemeToggle component for light/dark/system theme selection
  - Protected (app) route group layout with SidebarProvider
affects: [05-capture, dashboard, settings]

# Tech tracking
tech-stack:
  added: [shadcn/avatar]
  patterns: [offcanvas-sidebar, mounted-pattern-hydration, router-replace-locale-switch]

key-files:
  created:
    - src/app/[locale]/(app)/layout.tsx
    - src/components/layout/app-sidebar.tsx
    - src/components/layout/locale-switcher.tsx
    - src/components/layout/theme-toggle.tsx
    - src/components/ui/avatar.tsx
  modified:
    - src/middleware.ts
    - src/messages/en.json
    - src/messages/ro.json

key-decisions:
  - "Used Sidebar.useTranslations label approach instead of hardcoded section headers"
  - "LocaleSwitcher renders as compact button group (EN|RO) rather than dropdown"
  - "ThemeToggle uses icon-only buttons with aria-labels for compact footer placement"

patterns-established:
  - "Mounted pattern: useEffect-based mount check before rendering theme-dependent UI"
  - "(app) route group: all authenticated pages nested under (app) with sidebar layout"
  - "Sidebar footer pattern: user profile → logout → separator → locale → theme"

requirements-completed: [L10N-04, AUTH-05]

# Metrics
duration: 3min
completed: 2026-03-04
---

# Phase 01 Plan 04: Middleware & App Shell Summary

**Combined Clerk auth + next-intl middleware with responsive offcanvas sidebar featuring navigation, user profile, logout, locale switcher, and theme toggle**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-04T20:48:16Z
- **Completed:** 2026-03-04T20:52:01Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Combined Clerk + next-intl middleware with both public and protected route matchers (handles prefixed and unprefixed locale patterns)
- Responsive app sidebar with offcanvas mobile drawer, navigation items with active state highlighting
- User profile row with Clerk avatar/name/email, logout button using signOut()
- LocaleSwitcher (EN|RO compact toggle) using router.replace for instant language switching
- ThemeToggle (light/dark/system icon buttons) with mounted pattern preventing hydration mismatch
- Protected (app) route group layout wrapping all authenticated pages with SidebarProvider

## Task Commits

Each task was committed atomically:

1. **Task 1: Create combined Clerk + next-intl middleware and protected layout** - `b887c31` (feat)
2. **Task 2: Build app sidebar with navigation, user profile, logout, language/theme selectors** - `d352142` (feat)

## Files Created/Modified
- `src/middleware.ts` - Added public route matchers for /auth and /sso-callback
- `src/app/[locale]/(app)/layout.tsx` - Protected app layout with SidebarProvider + AppSidebar
- `src/app/[locale]/(app)/page.tsx` - Moved homepage into (app) route group
- `src/components/layout/app-sidebar.tsx` - Main sidebar with nav, user profile, logout, footer controls
- `src/components/layout/locale-switcher.tsx` - EN|RO language toggle using router.replace
- `src/components/layout/theme-toggle.tsx` - Light/dark/system theme selector with mounted pattern
- `src/components/ui/avatar.tsx` - shadcn avatar component for user profile
- `src/messages/en.json` - Added signOut translation key
- `src/messages/ro.json` - Added signOut translation key

## Decisions Made
- Used Sidebar useTranslations label approach instead of hardcoded section headers
- LocaleSwitcher renders as compact button group (EN|RO) rather than dropdown for sidebar footer placement
- ThemeToggle uses icon-only buttons with aria-labels for compact footer placement
- Added shadcn avatar component for user profile display in sidebar

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added shadcn avatar component**
- **Found during:** Task 2 (sidebar user profile)
- **Issue:** Avatar component needed for user profile display but not installed
- **Fix:** Ran `npx shadcn@latest add avatar`
- **Files modified:** src/components/ui/avatar.tsx
- **Verification:** Build passes with avatar component
- **Committed in:** d352142 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor — avatar component was implied by user profile requirement. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- App shell complete with sidebar navigation and all controls
- Ready for Plan 05 (camera capture and dashboard pages)
- All authenticated pages can now be created inside the (app) route group

## Self-Check: PASSED

All created files verified on disk. All task commits found in git history.

---
*Phase: 01-foundation*
*Completed: 2026-03-04*
