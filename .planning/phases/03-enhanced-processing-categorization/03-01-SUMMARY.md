---
phase: 03-enhanced-processing-categorization
plan: 01
subsystem: database
tags: [prisma, categories, vat, line-items, server-actions, zod]

# Dependency graph
requires:
  - phase: 02-core-receipt-capture
    provides: CapturedReceipt model, authActionClient pattern, Zod schemas
provides:
  - Category model with receipt-level and product-level types
  - ReceiptItem model with VAT rate/amount tracking
  - 39 seeded standard categories (19 receipt + 20 product)
  - Category CRUD server actions with ownership protection
  - categoryId and vatBreakdown fields on CapturedReceipt
affects: [03-02, 03-03, 03-04, spending-analytics, receipt-search]

# Tech tracking
tech-stack:
  added: [tsx]
  patterns: [category-slug-generation, prisma-upsert-seeding, transaction-safe-deletion]

key-files:
  created:
    - prisma/seed.ts
    - src/lib/data/categories.ts
    - src/schemas/category.ts
    - src/lib/actions/category.ts
  modified:
    - prisma/schema.prisma
    - prisma.config.ts
    - src/schemas/index.ts
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "39 categories total (19 receipt-level + 20 product-level) — plan listed 18 receipt but enumerated 19 including Other"
  - "Prisma 7 seed config in prisma.config.ts instead of package.json prisma.seed"
  - "Slug deduplication uses timestamp base36 suffix for user-created categories"
  - "Category deletion uses $transaction to unlink receipts/items before removing"

patterns-established:
  - "Category CRUD pattern: authActionClient + ownership check (isCustom + userId)"
  - "Prisma seed via tsx with PrismaPg adapter (same connection pattern as app)"

requirements-completed: [CAT-01, CAT-03, CAT-06]

# Metrics
duration: 4min
completed: 2026-03-06
---

# Phase 3 Plan 1: Category & Line Item Schema Summary

**Prisma Category + ReceiptItem models with VAT tracking, 39 seeded standard categories, and CRUD server actions with ownership protection**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-06T13:41:51Z
- **Completed:** 2026-03-06T13:46:50Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Category model with two-layer type system (receipt-level and product-level)
- ReceiptItem model persisting line items with VAT rate/amount and product categorization
- 39 standard categories seeded (19 receipt-level + 20 product-level) with Romanian translations
- CRUD server actions protecting system categories from user modification/deletion
- CapturedReceipt extended with categoryId relation and vatBreakdown JSON field

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend Prisma schema with Category, ReceiptItem, and VAT fields** - `d412de0` (feat)
2. **Task 2: Seed standard categories and create CRUD server actions** - `31ea080` (feat)

## Files Created/Modified
- `prisma/schema.prisma` - Category, ReceiptItem models; categoryId + vatBreakdown on CapturedReceipt
- `src/lib/data/categories.ts` - Standard category definitions with names, colors, icons, Romanian translations
- `src/schemas/category.ts` - Zod schemas and types for category CRUD operations
- `src/schemas/index.ts` - Re-exports category schemas
- `prisma/seed.ts` - Database seed script for standard categories via upsert
- `prisma.config.ts` - Added seed command configuration for Prisma 7
- `src/lib/actions/category.ts` - getCategories, createCategory, updateCategory, deleteCategory server actions
- `package.json` - Added tsx dev dependency and prisma seed config
- `pnpm-lock.yaml` - Updated lockfile

## Decisions Made
- **39 categories instead of 38:** Plan text said "18 receipt-level" but enumerated 19 (including Other). Kept all 19 receipt + 20 product = 39 total.
- **Prisma 7 seed in prisma.config.ts:** Prisma 7 moved seed configuration from package.json to prisma.config.ts `migrations.seed` field.
- **Slug deduplication:** Custom category slugs use `Date.now().toString(36)` suffix when collision detected, avoiding sequential numbering issues.
- **Transaction-safe deletion:** Category deletion wraps receipt/item unlinking + delete in `$transaction` to prevent orphaned references.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Prisma 7 seed config location**
- **Found during:** Task 2 (Seed setup)
- **Issue:** Plan specified `package.json` prisma.seed field, but Prisma 7 requires seed config in `prisma.config.ts` under `migrations.seed`
- **Fix:** Added `seed: "tsx prisma/seed.ts"` to `prisma.config.ts` migrations config
- **Files modified:** prisma.config.ts
- **Verification:** `prisma db seed` runs successfully
- **Committed in:** 31ea080

**2. [Rule 3 - Blocking] Database container not running**
- **Found during:** Task 1 (prisma db push)
- **Issue:** PostgreSQL container was stopped, `prisma db push` failed with P1001
- **Fix:** Started container with `sudo docker compose -f docker-compose.dev.yml up -d`
- **Files modified:** None (infrastructure)
- **Verification:** `prisma db push` succeeded after container started
- **Committed in:** d412de0

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both necessary for task completion. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Category and ReceiptItem models ready for Phase 3 Plan 2 (AI categorization integration)
- CRUD actions available for category management UI
- Standard categories seeded and queryable by type
- Ready for 03-02

---
*Phase: 03-enhanced-processing-categorization*
*Completed: 2026-03-06*
