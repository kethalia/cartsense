# Phase 2: Core Receipt Capture - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable reliable receipt photo capture and image upload with AI extraction of basic receipt data (vendor, amount, date, tax, payment type) and manual verification/correction before saving. Users can verify AI results, manually enter data when AI fails, and merge data from both sources. PDF support, line items, batch upload, and categorization are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Receipt Processing Flow
- Inline processing: user stays on the same screen after capture/upload while AI extracts data (2-5 seconds expected)
- Loading state: skeleton form placeholder appears next to receipt image, showing the layout taking shape while AI processes
- 10-second timeout: if AI hasn't responded, show "This is taking longer than usual" with a button to skip to manual entry
- AI continues processing in background after user skips to manual entry
- If AI completes while user is mid-manual-entry: show a sticky banner pinned at the top of the form ("AI extraction ready — Compare & merge") with a merge button and dismiss X. Stays visible until acted on or dismissed. NOT a toast (too ephemeral).

### Verification & Editing Screen
- Stacked cards UI using the existing StackedCardsWithTabs component (motion/react animations, tab navigation)
- 4 cards in the stack:
  1. **Image View** — The receipt photo (zoomable/pannable reference)
  2. **Manual Entry** — Editable form fields, each with a checkbox/toggle to include in merge
  3. **AI Extracted** — Read-only extracted data, each with a checkbox/toggle to include in merge
  4. **Merge Preview** — Live preview showing combined result based on selections from cards 2 & 3
- Field selection rules:
  - Exclusive fields (vendor, total amount, date, tax, payment type): selecting on one card auto-deselects on the other — only one source wins per field
  - Combinable fields (line items/products): can be included from both — but NOT in Phase 2 (line items deferred)
- Merge preview updates live in real-time as user toggles field selections on cards 2 & 3
- Default state when AI succeeds: AI Extracted card on top, all AI fields pre-selected. User just verifies and saves in the happy path.
- Core 5 fields only for Phase 2: vendor name, total amount, date, tax amount, payment type

### Upload Experience
- Expanded FAB menu: tapping existing FAB opens a small menu with "Take photo" (camera) and "Upload image" (file picker)
- Single entry point for both capture methods, consistent on desktop and mobile
- Images only: JPG and PNG supported. No PDF or other document support in Phase 2.
- Basic validation before processing:
  - File type: JPG/PNG only
  - Max file size: 10MB (matches existing limit)
  - Minimum resolution: ~300x300 to reject tiny/useless images
  - Clear error messages explaining rejection reason

### Manual Entry Fallback
- Manual entry card is always available in the stack but only auto-surfaces (comes to front) when AI extraction fails or times out
- On AI failure: empty form with field labels and placeholder hints showing expected format (e.g., "Kaufland", "125.50", "05/03/2026")
- Payment type field: toggle buttons — Cash / Card / Other. One-tap selection.
- Required fields: vendor name and total amount. Form cannot be saved without these.
- Optional fields: date (defaults to today if left empty), tax amount, payment type
- Inline validation errors for required fields

### Claude's Discretion
- Exact skeleton form animation and shimmer design
- Stacked cards color scheme and visual styling (adapt component to match app theme)
- Exact FAB menu animation and positioning
- AI extraction error messages wording
- Minimum resolution threshold (approximately 300x300, exact value flexible)
- Form field ordering and spacing
- Toggle button styling for payment type

</decisions>

<specifics>
## Specific Ideas

- Stacked cards component already exists (StackedCardsWithTabs) using motion/react with spring animations, tab navigation, and click-to-bring-to-front interaction. Adapt this for the 4-card receipt verification flow.
- Sticky banner pattern (not toast) for "AI ready" notification during manual entry — must be persistent and always visible, dismissible with X button
- Merge concept: field-by-field selection where exclusive fields are radio-style (pick one source) and the merge preview reflects choices in real-time
- The happy path should be minimal friction: capture/upload → AI extracts → user verifies AI card → save. Most users shouldn't need to touch manual entry.

</specifics>

<deferred>
## Deferred Ideas

- PDF document upload support (RCPT-02 partial) — future phase or Phase 2 enhancement
- Line items / product list extraction — Phase 3 (Enhanced Processing)
- Batch upload of multiple receipts — Phase 3 (RCPT-05)
- Romanian vendor recognition — Phase 3 (RCPT-06)
- Image quality enhancement (brightness, contrast, crop) — Phase 3 (RCPT-08)
- Drag-and-drop upload on desktop — future polish
- Clipboard paste (Ctrl+V) for desktop — future polish
- User preference setting for "always start with manual entry" — future polish

</deferred>

---

*Phase: 02-core-receipt-capture*
*Context gathered: 2026-03-05*
