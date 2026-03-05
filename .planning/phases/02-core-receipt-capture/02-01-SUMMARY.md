---
phase: 02-core-receipt-capture
plan: 01
subsystem: api
tags: [anthropic, claude-vision, prisma, receipt-extraction, server-actions, zod]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Prisma schema with CapturedReceipt model, safe-action client, auth middleware"
provides:
  - "Extended CapturedReceipt model with 9 extraction fields"
  - "Shared TypeScript types for receipt extraction flow (ExtractionResult, FieldSources, ManualEntryData, etc.)"
  - "extractReceipt server action (Claude Vision API integration)"
  - "saveVerifiedReceipt server action (verified data persistence)"
affects: [02-02, 02-03, 02-04]

# Tech tracking
tech-stack:
  added: ["@anthropic-ai/sdk"]
  patterns: ["Claude Vision API for structured data extraction", "JSON response parsing with fallback confidence scoring", "authActionClient pattern for receipt ownership verification"]

key-files:
  created:
    - "src/types/receipt.ts"
    - "src/actions/extract-receipt.ts"
    - "src/actions/save-verified-receipt.ts"
  modified:
    - "prisma/schema.prisma"
    - ".env.example"
    - "package.json"

key-decisions:
  - "Used claude-sonnet-4-20250514 model for cost-effective structured extraction"
  - "Decimal(10,2) for RON currency financial fields (not Float)"
  - "Lazy Anthropic client initialization to fail fast on missing API key"
  - "Confidence calculated from extracted field count when AI doesn't provide one"

patterns-established:
  - "Receipt types are canonical contracts: all Phase 2 plans import from src/types/receipt.ts"
  - "Extraction actions follow authActionClient + Zod schema pattern from capture-receipt.ts"
  - "rawExtraction JSON field stores full AI response for debugging"

requirements-completed: [RCPT-03]

# Metrics
duration: 3min
completed: 2026-03-05
---

# Phase 2 Plan 1: Receipt Extraction Data Layer & AI Actions Summary

**Extended CapturedReceipt schema with 9 extraction fields, shared TypeScript types for Phase 2 contracts, and Claude Vision extraction + save-verified server actions**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-05T14:13:55Z
- **Completed:** 2026-03-05T14:17:39Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Extended CapturedReceipt Prisma model with extractionStatus, vendorName, totalAmount, receiptDate, taxAmount, paymentType, confidence, rawExtraction, and verifiedAt fields
- Created comprehensive shared types file (src/types/receipt.ts) exporting all data contracts for the entire Phase 2
- Built extractReceipt server action that reads receipt images, calls Claude Vision API, parses structured JSON, and updates DB
- Built saveVerifiedReceipt server action with Zod validation for persisting user-verified receipt data

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend Prisma schema and create shared TypeScript types** - `2066bf6` (feat)
2. **Task 2: Create AI extraction and save-verified server actions** - `d96c923` (feat)

## Files Created/Modified
- `prisma/schema.prisma` - Added 9 extraction fields to CapturedReceipt model
- `src/types/receipt.ts` - Shared TypeScript types: ExtractionStatus, ExtractionResult, ReceiptFieldName, FieldSource, FieldSources, ManualEntryData, VerifiedReceiptData, PaymentType, RECEIPT_FIELDS
- `src/actions/extract-receipt.ts` - Server action calling Claude Vision API for structured receipt data extraction
- `src/actions/save-verified-receipt.ts` - Server action to persist user-verified receipt data with Zod validation
- `.env.example` - Added ANTHROPIC_API_KEY documentation
- `package.json` - Added @anthropic-ai/sdk dependency
- `pnpm-lock.yaml` - Updated lockfile

## Decisions Made
- Used claude-sonnet-4-20250514 for cost-effective receipt extraction (sufficient quality for structured data)
- Used Decimal(10,2) for financial fields to avoid floating point issues with RON currency
- Lazy Anthropic client initialization (throws immediately if API key missing)
- Fallback confidence scoring: counts non-null extracted fields / total fields when AI doesn't return confidence

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

**External services require manual configuration.** User needs:
- `ANTHROPIC_API_KEY` - Get from https://console.anthropic.com/settings/keys and add to `.env`

## Next Phase Readiness
- Data layer and types ready for all downstream Phase 2 plans (02-02, 02-03, 02-04)
- Ready for 02-02: Upload experience and FAB menu
- All shared type contracts established for verification UI, merge logic, and manual entry

---
*Phase: 02-core-receipt-capture*
*Completed: 2026-03-05*
