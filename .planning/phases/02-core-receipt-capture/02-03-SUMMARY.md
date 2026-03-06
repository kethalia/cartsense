---
phase: 02-core-receipt-capture
plan: 03
subsystem: ui
tags:
  [
    motion,
    spring-animation,
    stacked-cards,
    receipt-verification,
    react-hooks,
    form-validation,
  ]

# Dependency graph
requires:
  - phase: 02-core-receipt-capture
    provides: "Shared TypeScript types (ExtractionResult, FieldSources, ManualEntryData, ReceiptData) from src/types/receipt.ts"
provides:
  - "StackedCardsWithTabs reusable animated card component"
  - "4 receipt verification cards (Image, Manual Entry, AI Extracted, Merge Preview)"
  - "useFieldSources hook for per-field source selection and merge computation"
  - "ReceiptVerification wrapper component composing the full verification UI"
affects: [02-04]

# Tech tracking
tech-stack:
  added: [motion]
  patterns:
    [
      "Spring-animated stacked cards with tab navigation",
      "Per-field source selection with exclusive toggle",
      "Live merge computation via useMemo",
      "Controlled/uncontrolled card component pattern",
    ]

key-files:
  created:
    - "src/components/receipt/stacked-cards.tsx"
    - "src/components/receipt/image-card.tsx"
    - "src/components/receipt/ai-data-card.tsx"
    - "src/components/receipt/manual-entry-card.tsx"
    - "src/components/receipt/merge-preview-card.tsx"
    - "src/components/receipt/receipt-verification.tsx"
    - "src/hooks/use-field-sources.ts"
  modified:
    - "package.json"

key-decisions:
  - "Used motion/react AnimatePresence with spring config (stiffness:300, damping:30) for snappy card transitions"
  - "Native img tag instead of Next.js Image for base64 data (unoptimized mode not needed)"
  - "FieldSources are exclusive per field (ai OR manual) managed by simple state map, no bidirectional deselect needed"

patterns-established:
  - "StackedCardsWithTabs: generic pattern for any multi-card UI with animated transitions"
  - "useFieldSources: field-level source selection hook pattern reusable for any merge-from-two-sources UI"

requirements-completed: [RCPT-04, RCPT-07]

# Metrics
duration: 3min
completed: 2026-03-05
---

# Phase 2 Plan 3: Stacked Cards Verification UI Summary

**Spring-animated stacked cards component with 4 receipt verification cards (Image, Manual Entry, AI Extracted, Merge Preview), per-field source selection hook, and live merge preview**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-05T14:20:49Z
- **Completed:** 2026-03-05T14:24:26Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Installed motion library and created StackedCardsWithTabs — a reusable animated stacked card component with tab navigation and spring transitions
- Built 4 receipt-specific cards: ImageCard (receipt display with zoom), AIDataCard (extraction results with per-field checkboxes), ManualEntryCard (5-field form with payment toggle buttons), MergePreviewCard (live computed merge with source badges)
- Created useFieldSources hook managing per-field source selection, merge computation, and validation (required: vendor + amount)
- Built ReceiptVerification wrapper that composes all cards with default active card logic (AI on top when available, manual when AI fails)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install motion and create StackedCardsWithTabs, ImageCard, AIDataCard** - `7b7009a` (feat)
2. **Task 2: Build manual entry, merge preview, field sources hook, and verification wrapper** - `505c31e` (feat)

## Files Created/Modified

- `src/components/receipt/stacked-cards.tsx` - Generic animated stacked cards with tab bar and spring transitions
- `src/components/receipt/image-card.tsx` - Receipt image display with double-click zoom
- `src/components/receipt/ai-data-card.tsx` - Read-only AI extraction results with per-field checkboxes and confidence badge
- `src/components/receipt/manual-entry-card.tsx` - 5-field form with payment type toggle buttons, inline validation, merge checkboxes
- `src/components/receipt/merge-preview-card.tsx` - Live merge preview with AI/Manual source badges and validity warning
- `src/components/receipt/receipt-verification.tsx` - Main wrapper composing 4 cards in StackedCardsWithTabs with Save button
- `src/hooks/use-field-sources.ts` - Field source selection hook with merge computation and validation
- `package.json` - Added motion dependency

## Decisions Made

- Used motion/react with AnimatePresence and spring config (stiffness: 300, damping: 30) for snappy but non-bouncy transitions
- Used native img element for base64 receipt images instead of Next.js Image component (simpler for base64 data)
- Field sources are a simple Record mapping each field to 'ai' or 'manual' — no bidirectional deselect needed since toggling one field to a source is the only operation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All verification UI components ready for Plan 04 (verify page route and i18n integration)
- ReceiptVerification component accepts props from parent page (imageData, aiData, onSave)
- Ready for 02-04: Verify/correct page route, i18n keys, and end-to-end flow

---

_Phase: 02-core-receipt-capture_
_Completed: 2026-03-05_
