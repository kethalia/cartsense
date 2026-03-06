# Phase 3: Enhanced Processing & Categorization - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Advanced receipt processing with automatic categorization and search capabilities. This phase makes receipts *useful* after capture — auto-categorizing them, recognizing Romanian vendors, enhancing image quality, enabling search, and handling VAT correctly. Builds on Phase 2's capture and verification flow.

Requirements: RCPT-05, RCPT-06, RCPT-08, CAT-01, CAT-02, CAT-03, CAT-05, CAT-06.
CAT-04 (business vs personal) deferred — see Deferred Ideas.

</domain>

<decisions>
## Implementation Decisions

### Category system
- Two-layer category model:
  - **Receipt-level categories (15-18):** Classify the store/transaction type — Groceries, Restaurants, Transport, Entertainment, Health, Utilities, Shopping, Education, Services, Coffee/Bars, Clothing, Electronics stores, Home, Subscriptions, Fuel, Personal Care, Gifts, Travel, Other
  - **Product-level categories (18-22, food-focused):** Classify individual line items — Meat, Dairy, Bread/Bakery, Fruits & Vegetables, Sweets/Snacks, Canned/Dry goods, Frozen, Drinks, Alcohol, Tobacco, Electronics, Household, Cleaning, Personal Care, Health/Pharma, Pet supplies, Baby, Stationery, Clothing, Other
- Food sub-categories are granular because Romanian grocery receipts (Kaufland, Mega Image, Lidl) are the most common receipt type and granular breakdowns unlock analytics value in later phases
- Non-food product categories stay broad since those receipts are typically single-category

### Category display & interaction
- Auto-categorization shown as a **colored chip/badge** on the receipt — tappable to override
- Color per category builds visual memory for quick scanning
- Same chip pattern used across receipt list, detail view, and search results

### Custom categories
- **Inline creation:** When overriding a category, user can type a new name — it becomes a custom category automatically
- **Settings page:** Dedicated category management in Settings — add, rename, reorder, set color/icon, delete custom categories
- Both paths available: inline for quick adds, Settings for curation

### Receipt list layout
- Receipts **grouped by date** (Today, Yesterday, March 4…)
- Each date group header shows a **daily spending total**
- Compact cards within each group showing vendor, amount, category chip

### Search experience
- **Search bar + filter chips** at the top of the receipt list
- Text search covers vendor, amount, category, and product names
- Filter chips below search bar: category, date range, amount range
- Filters apply in place — no page navigation

### Search results display
- Receipt list **filters in place** (same layout, fewer items)
- **Match context highlighting:** matching text is highlighted, and if a product name matched inside a receipt, that product is shown below the receipt card
- Clear "X" to reset all, or remove individual filter chips

### No-results state
- "No receipts match" message with active filter chips visible and individually removable
- Guides user to adjust filters rather than dead-ending

### Batch upload flow
- **Add-to-queue** model: user picks images from one source, they appear in a queue, user can keep adding from different sources (camera roll, files, etc.)
- **Hard limit of 5 receipts per batch** — enforced, not soft. Subscription-tier increases deferred to Phase 7
- Processing shows **per-receipt status with thumbnails**: each item shows queued → uploading → extracting → done/failed with a small receipt image preview
- After processing: **summary screen with selective review** — shows all results (vendor, amount, confidence), user taps any to review/edit, then "Save all" for the rest

### Claude's Discretion
- Exact standard category colors and icons
- Image enhancement implementation (brightness, contrast, crop algorithms)
- Vendor recognition approach for Romanian stores (RCPT-06)
- VAT calculation implementation details (CAT-06)
- Loading skeleton and transition animations
- Search debounce timing and result ranking algorithm
- Product-level line items DB schema design (deferred from Phase 2)

</decisions>

<specifics>
## Specific Ideas

- Romanian grocery receipts (Kaufland, Mega Image, Lidl) are the dominant receipt type — the food sub-category granularity reflects this
- Product-level categorization exists because a single grocery receipt contains many product types (meat, dairy, sweets, tobacco, etc.)
- The batch summary screen is about speed — users who batch-upload shouldn't be forced to verify every receipt, only the ones that look wrong
- Thumbnails in batch processing are essential because receipts are unidentifiable without them until extraction gives a vendor name

</specifics>

<deferred>
## Deferred Ideas

- **CAT-04: Business vs personal flagging** — User chose to skip this entirely for now. Focus fully on a solid personal expense system first. Revisit in a future phase.
- **Subscription-based batch limits** — Phase 7 (Subscription Management) can increase the 5-receipt batch limit for paid tiers.

</deferred>

---

*Phase: 03-enhanced-processing-categorization*
*Context gathered: 2026-03-06*
