---
phase: 01-foundation
plan: 03
subsystem: auth
tags: [clerk, email-otp, google-oauth, dialog, drawer, passwordless]

requires:
  - phase: 01-foundation/01
    provides: "Project scaffold with Clerk SDK, shadcn components"
  - phase: 01-foundation/02
    provides: "[locale] layout with ClerkProvider, NextIntlClientProvider, message files"
provides:
  - "Email OTP authentication flow (sign-in and sign-up unified)"
  - "Google OAuth authentication via Clerk SSO"
  - "Responsive auth screen (Dialog desktop, Drawer mobile)"
  - "Auth page route at /[locale]/auth"
  - "SSO callback route at /[locale]/sso-callback"
affects: [auth, dashboard, settings]

tech-stack:
  added: ["@clerk/react HandleSSOCallback"]
  patterns: ["Clerk v7 signals API (useSignIn/useSignUp with signIn.emailCode.sendCode/verifyCode)", "mounted guard for SSR-safe responsive rendering", "unified sign-in/sign-up with email fallback to signUp"]

key-files:
  created:
    - src/components/auth/email-otp-form.tsx
    - src/components/auth/google-auth-button.tsx
    - src/components/auth/auth-screen.tsx
    - src/app/[locale]/auth/page.tsx
    - src/app/[locale]/sso-callback/page.tsx
  modified:
    - src/messages/en.json
    - src/messages/ro.json

key-decisions:
  - "Used Clerk v7 signals API (signIn.emailCode.sendCode/verifyCode) instead of legacy prepareFirstFactor/attemptFirstFactor"
  - "HandleSSOCallback imported from @clerk/react (not @clerk/nextjs which only exports legacy AuthenticateWithRedirectCallback)"
  - "Auth screen uses mounted guard to avoid hydration mismatch between Dialog/Drawer rendering"
  - "AUTH-03 (password reset) fulfilled by design — passwordless auth eliminates need"

patterns-established:
  - "Clerk v7 custom flow: signIn.create → signIn.emailCode.sendCode → verifyCode → finalize"
  - "Unified auth: try signIn first, fall back to signUp on identifier_not_found"
  - "Responsive container: Dialog for desktop, Drawer for mobile via useIsMobile hook"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04]

duration: 10min
completed: 2026-03-04
---

# Phase 1 Plan 3: Clerk Authentication Integration Summary

**Passwordless auth with email OTP + Google OAuth using Clerk v7 signals API, responsive dialog/drawer auth screen**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-04T20:35:04Z
- **Completed:** 2026-03-04T20:45:18Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Unified sign-in/sign-up flow with email OTP using Clerk v7 custom flow API
- Google OAuth one-click authentication via signIn.sso()
- Responsive auth screen: Dialog on desktop, Drawer on mobile (both non-dismissible)
- Auth page and SSO callback routes with proper locale support
- All auth UI text localized in Romanian and English

## Task Commits

Each task was committed atomically:

1. **Task 1: Build email OTP form and Google auth button components** - `9b83bdf` (feat)
2. **Task 2: Build unified auth screen and auth routes** - `33f09ad` (feat)

## Files Created/Modified
- `src/components/auth/email-otp-form.tsx` - Two-step email OTP form (enter email → enter code) with unified sign-in/sign-up
- `src/components/auth/google-auth-button.tsx` - Google OAuth button using Clerk signIn.sso()
- `src/components/auth/auth-screen.tsx` - Responsive auth container (Dialog desktop / Drawer mobile)
- `src/app/[locale]/auth/page.tsx` - Auth page route with centered layout
- `src/app/[locale]/sso-callback/page.tsx` - Google OAuth SSO callback handler
- `src/messages/en.json` - Added Auth translation keys (emailPlaceholder, continue, resendCode, etc.)
- `src/messages/ro.json` - Added Romanian Auth translation keys

## Decisions Made
- **Clerk v7 signals API**: Used new signIn.emailCode.sendCode/verifyCode pattern instead of legacy prepareFirstFactor/attemptFirstFactor. v7 returns `{ error }` from all methods.
- **HandleSSOCallback from @clerk/react**: The `@clerk/nextjs` package only exports the legacy `AuthenticateWithRedirectCallback`. The v7 `HandleSSOCallback` with navigateToApp/navigateToSignIn is in `@clerk/react`.
- **Mounted guard**: Auth screen renders null during SSR to prevent hydration mismatch between Dialog (desktop) and Drawer (mobile) components.
- **AUTH-03 by design**: Password reset is N/A — system is passwordless, no passwords exist to reset.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Clerk v7 API differs from plan's assumed API**
- **Found during:** Task 1
- **Issue:** Plan specified `useSignIn()` returns `{ signIn, isLoaded }` and uses `signIn.prepareFirstFactor()` / `signIn.attemptFirstFactor()`. Clerk v7 uses signals API: returns `{ signIn, fetchStatus, errors }` with `signIn.emailCode.sendCode()` / `signIn.emailCode.verifyCode()` and `{ error }` return pattern.
- **Fix:** Rewrote all Clerk API calls to use v7 signals pattern
- **Files modified:** src/components/auth/email-otp-form.tsx, src/components/auth/google-auth-button.tsx
- **Verification:** Build succeeds with no type errors
- **Committed in:** 9b83bdf

**2. [Rule 3 - Blocking] HandleSSOCallback not exported from @clerk/nextjs**
- **Found during:** Task 2
- **Issue:** Plan assumed `AuthenticateWithRedirectCallback` or `HandleSSOCallback` from `@clerk/nextjs`. Only the legacy version is exported; v7's `HandleSSOCallback` is in `@clerk/react`.
- **Fix:** Import from `@clerk/react` instead
- **Files modified:** src/app/[locale]/sso-callback/page.tsx
- **Verification:** Build succeeds
- **Committed in:** 33f09ad

**3. [Rule 3 - Blocking] Google OAuth uses signIn.sso() not authenticateWithRedirect**
- **Found during:** Task 1
- **Issue:** Plan assumed `signIn.authenticateWithRedirect()`. Clerk v7 uses `signIn.sso()` with `redirectCallbackUrl` (not `redirectUrlComplete`).
- **Fix:** Updated to use `signIn.sso({ strategy, redirectUrl, redirectCallbackUrl })`
- **Files modified:** src/components/auth/google-auth-button.tsx
- **Verification:** Build succeeds with correct types
- **Committed in:** 9b83bdf

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All deviations were due to Clerk v7 API changes from what the plan assumed. No scope creep. Core functionality is identical.

## Issues Encountered
None — once the correct v7 API was identified from type definitions, implementation proceeded smoothly.

## User Setup Required

**External services require manual configuration.** Clerk Dashboard setup needed:
- **Environment variables:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from Clerk Dashboard → API Keys
- **Dashboard configuration:**
  1. Create a new Clerk application at dashboard.clerk.com
  2. Enable "Email verification code" (disable Password) under User & Authentication
  3. Enable Google OAuth social provider under Social Connections
  4. Set session lifetime to 2592000 seconds (30 days) under Sessions

## Next Phase Readiness
- Auth foundation complete — email OTP and Google OAuth flows implemented
- Ready for Plan 04 (app shell with sidebar navigation)
- Auth page at `/[locale]/auth` can be linked from middleware protection redirects

---
*Phase: 01-foundation*
*Completed: 2026-03-04*
