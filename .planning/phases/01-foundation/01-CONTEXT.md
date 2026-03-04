# Phase 1: Foundation & Core Authentication - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the app's secure user foundation with passwordless authentication (email OTP + Google OAuth), Romanian/English localization with theme support, and a basic mobile camera capture entry point. No receipt processing — just prove the capture pipeline works end-to-end.

</domain>

<decisions>
## Implementation Decisions

### Tech Stack
- Next.js 15 + TypeScript
- Tailwind CSS + shadcn/ui components
- Clerk for authentication (email OTP + Google OAuth only — no password management)
- PostgreSQL + Prisma ORM
- Vercel (EU region) / self-hosted deployment — keep both options viable
- AUTH-03 (password reset via email) is irrelevant — no passwords exist
- AUTH-01 reframed: "User can create account with email OTP or Google OAuth"

### Registration & Login Flow
- Single unified auth screen — no separate sign-up vs login distinction (passwordless makes them identical)
- Auth presented as dialog on desktop, drawer on mobile
- No extra information collected at sign-up — just authenticate. Name/avatar come from Google if available, otherwise blank
- After first login, land directly on the main dashboard (empty state). No onboarding tour or guided flow — empty states do the onboarding work
- Long-lived sessions (30 days). Only log out on explicit user action or 30-day inactivity

### Language & Locale Experience
- Auto-detect language from browser locale. Romanian if browser is RO, English otherwise
- Language selector lives as a secondary item in the shadcn sidebar (not in header)
- Theme selector also in the sidebar as a secondary item alongside language
- Theme support from day one: light, dark, and system preference (three options)
- Language switch is instant — entire UI re-renders immediately, no page reload, no confirmation dialog

### App Shell & Navigation
- shadcn sidebar as the main navigation component
- On mobile: off-canvas drawer triggered by hamburger menu
- Three screens in Phase 1: Dashboard (home), Settings (profile/language/theme), Camera capture
- Spacious and clean visual density — generous whitespace, large touch targets, card-based content areas
- Neutral color palette with a single accent color for primary actions. Clean grays/whites for surfaces

### Camera Capture Entry Point
- Floating action button (FAB) at bottom-right of dashboard, always visible — receipt capture is the core action
- Tapping FAB opens the native camera viewfinder directly — no intermediate choice sheet
- After capture: quick preview screen with "Use this" and "Retake" buttons only
- After confirming: photo is saved, user sees "Receipt saved! Processing coming soon." success message, returns to dashboard
- Dashboard empty state updates to show captured receipt as a thumbnail/card (proves pipeline works even without Phase 2 processing)

### Claude's Discretion
- Exact accent/brand color selection
- Loading skeleton and spinner designs
- Error state layouts and copy
- Sidebar item ordering and iconography
- Camera viewfinder overlay styling
- Empty state illustration style
- Exact spacing scale and typography choices

</decisions>

<specifics>
## Specific Ideas

- Auth dialog/drawer pattern: dialog for wide screens, drawer for mobile — consistent with modern shadcn patterns
- Sidebar should have language and theme as secondary rows (footer area of sidebar)
- Visual feel reference: calm, premium, financial-app appropriate — content (receipts, numbers) should be the focus
- After camera capture in Phase 1, the dashboard should visually reflect that something was captured (thumbnail/card) even though processing isn't built yet

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-04*
