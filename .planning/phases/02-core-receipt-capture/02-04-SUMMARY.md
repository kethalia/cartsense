---
phase: 02-core-receipt-capture
plan: 04
subsystem: integration
tags:
  [
    verification-page,
    ai-extraction,
    processing-pipeline,
    i18n,
    drawer-ui,
    stacked-cards-rewrite,
    line-items,
  ]

# Dependency graph
requires:
  - phase: 02-core-receipt-capture
    provides: "AI extraction action, save-verified action, shared types from Plans 01-03"
provides:
  - "End-to-end receipt capture → process → verify → save pipeline"
  - "Verification page at /receipt/[id]/verify with auth protection"
  - "Processing skeleton UI with timeout and skip-to-manual flow"
  - "AI-ready sticky banner for background extraction completion"
  - "Verification drawer integration in CaptureFlow (primary UX)"
  - "Full EN/RO localization for all receipt verification text"
  - "Product line items in manual entry"
affects: [03-spending-analytics]

# Tech tracking
tech-stack:
  added: []
  patterns:
    [
      "Drawer-based verification flow",
      "Background AI processing with sticky banner",
      "Reference-pattern stacked cards (offset/rotation/scale)",
      "Product line items in manual entry form",
    ]

key-files:
  created:
    - "src/app/[locale]/(app)/receipt/[id]/verify/page.tsx"
    - "src/components/receipt/verification-client.tsx"
    - "src/components/receipt/processing-skeleton.tsx"
    - "src/components/receipt/ai-ready-banner.tsx"
    - "src/components/receipt/verification-drawer.tsx"
  modified:
    - "src/proxy.ts"
    - "src/messages/en.json"
    - "src/messages/ro.json"
    - "src/components/receipt/stacked-cards.tsx"
    - "src/components/capture/capture-flow.tsx"
    - "src/components/receipt/receipt-verification.tsx"
    - "src/components/receipt/manual-entry-card.tsx"
    - "src/types/receipt.ts"
    - "src/actions/extract-receipt.ts"

key-decisions:
  - "VerificationDrawer as primary UX instead of separate page navigation"
  - "Stacked cards rewritten to reference pattern (offset/rotation/scale, array reorder, bottom pill tabs)"
  - "Claude 3 Haiku (claude-3-haiku-20240307) for free tier extraction, Sonnet 4 for premium"
  - "Product line items added to manual entry (in-memory only, DB schema in Phase 3)"
  - "Cards constrained to max-w-sm width per user preference"

patterns-established:
  - "Drawer verification flow: capture → save image → open drawer → process → verify → save"
  - "Background AI with banner: AI continues after user skips, sticky banner on completion"

requirements-completed: [RCPT-03, RCPT-04, RCPT-07]

# Metrics
duration: multi-session
completed: 2026-03-05
---

# Phase 2 Plan 4: Verify Page Route, i18n & End-to-End Flow Summary

**Complete receipt verification pipeline with drawer-based UI, AI extraction via Claude Haiku, stacked cards rewrite matching reference pattern, product line items, and full EN/RO localization**

## Performance

- **Duration:** Multi-session (initial + checkpoint + fixes)
- **Tasks:** 3 (2 auto + 1 checkpoint:human-verify)
- **Files created:** 5
- **Files modified:** 9

## Accomplishments

- Created verification page at `/receipt/[id]/verify` with auth-protected server component that loads receipt from DB
- Built VerificationClient orchestrating the processing → verification → save pipeline with 10s timeout and skip-to-manual flow
- Created ProcessingSkeleton with receipt image thumbnail and animated field skeletons during AI processing
- Created AIReadyBanner sticky banner shown when AI completes during manual entry
- Created VerificationDrawer wrapping VerificationClient in a sheet/drawer (primary UX over page navigation)
- Updated CaptureFlow to open verification drawer after image save instead of navigating
- Rewrote stacked-cards.tsx to match reference implementation (offset/rotation/scale spring animations, array reorder on click, bottom pill tabs)
- Added full Receipt namespace to EN/RO localization (40+ keys with proper Romanian diacritics)
- Added product line items section to ManualEntryCard with add/remove/edit and subtotal calculation
- Fixed AI model name bug (claude-haiku-4-20250414 → claude-3-haiku-20240307)
- Added error logging with model info on extraction failures

## Task Commits

1. **Task 1: Create verification page with processing pipeline** - `ded07d1` (feat)
2. **Task 2: Add localization for receipt verification screens** - `4d801ff` (feat)
3. **Fix: Rewrite stacked cards and add verification drawer** - `4e8c590` (fix)
4. **Fix: AI model name and product line items** - `3064238` (fix)

### Related commits (cross-plan fixes during Phase 2):

- `f94bf0f` - feat(02-01): use Haiku for free tier, Sonnet reserved for premium
- `b5338f9` - fix(02-01): increase server action body limit to 15mb for receipt images
- `44fb494` - chore: upgrade to Next.js 16 with breaking change migration

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed AI model name**

- **Found during:** Checkpoint testing
- **Issue:** `claude-haiku-4-20250414` model ID does not exist on the Anthropic API, returning 404
- **Fix:** Changed to `claude-3-haiku-20240307` which is the currently available Haiku model
- **Files modified:** `src/actions/extract-receipt.ts`
- **Commit:** `3064238`

**2. [Rule 1 - Bug] Stacked cards not matching reference implementation**

- **Found during:** Checkpoint testing
- **Issue:** Original implementation used AnimatePresence with opacity fading, not the offset/rotation/scale pattern
- **Fix:** Complete rewrite of stacked-cards.tsx to use array reorder pattern with spring animations matching the reference at kethalia/stacked-cards-example
- **Files modified:** `src/components/receipt/stacked-cards.tsx`
- **Commit:** `4e8c590`

**3. [Rule 2 - Missing functionality] Verification drawer instead of page navigation**

- **Found during:** Checkpoint testing (user preference)
- **Issue:** User wanted verification as a modal/drawer, not a separate page navigation
- **Fix:** Created VerificationDrawer component, updated CaptureFlow to open drawer after save
- **Files modified:** `src/components/receipt/verification-drawer.tsx`, `src/components/capture/capture-flow.tsx`, `src/components/receipt/verification-client.tsx`
- **Commit:** `4e8c590`

**4. [Rule 2 - Missing functionality] Product line items in manual entry**

- **Found during:** Checkpoint testing (user request)
- **Issue:** Manual entry card had no products section; user explicitly requested line items
- **Fix:** Added ItemFormData type, product add/remove/edit UI with subtotal calculation
- **Files modified:** `src/types/receipt.ts`, `src/components/receipt/manual-entry-card.tsx`, `src/components/receipt/receipt-verification.tsx`
- **Commit:** `3064238`

## Issues Encountered

- Next.js was upgraded from 15 to 16 during this phase, requiring proxy.ts rename, experimental serverActions config, and webpack build flag
- Multiple Haiku model IDs tried before finding the working one (claude-3-haiku-20240307)
- Stale LSP errors for removed Clerk imports in files that no longer exist on disk

## User Setup Required

- `ANTHROPIC_API_KEY` must be set in `.env` or `.env.local` for AI extraction to work
- Database must be running and migrated (`prisma db push`)

## Next Phase Readiness

- Complete Phase 2 receipt capture pipeline is working end-to-end
- Ready for Phase 3: spending analytics, receipt history, and categorization
- Line items are stored in-memory only; Phase 3 should add a ItemFormData DB table for persistence

## Self-Check: PASSED

All 12 files verified present on disk. All 4 commits verified in git history.

---

_Phase: 02-core-receipt-capture_
_Completed: 2026-03-05_
