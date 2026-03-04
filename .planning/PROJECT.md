# CartSense - Receipt Intelligence App

## What This Is

A mobile-first web app where users snap photos of receipts and get instant AI-powered extraction, categorization, and analytics. Think of it as a personal finance analyst that lives in your pocket and understands every grocery run, restaurant visit, and impulse buy, specifically designed for the Romanian market with native support for local receipt formats and stores.

## Core Value

Transform the tedious manual process of tracking expenses into effortless insights by making receipt data capture and analysis as simple as taking a photo.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Receipt photo capture with AI extraction of line items (product, quantity, unit price, total, discounts)
- [ ] Romanian receipt format support (BUC, Kg, REDUCERE, STORNARE, GARANTIE AMBALAJ)
- [ ] Multiple receipt types: supermarkets, restaurants, delivery services
- [ ] Manual correction UI with user verification workflow
- [ ] Auto-categorization of items (groceries, meat, dairy, beverages, household, dining out)
- [ ] Store auto-tagging (Mega Image, Good Market, Pizza Hut, etc.)
- [ ] Price tracking across stores and dates with historical data
- [ ] Spending analytics dashboard with monthly/weekly breakdowns
- [ ] User authentication and subscription management
- [ ] Mobile-responsive PWA for home screen installation
- [ ] Batch upload capability for historical receipts

### Out of Scope

- Multi-country support — Romanian market first, expand later
- Real-time store price comparison API — build internal database first
- Receipt sharing between users — focus on individual tracking initially
- Barcode scanning — photo-based extraction sufficient for MVP
- Integration with banks/credit cards — manual receipt capture only

## Context

**Personal Pain Point:** Born from direct experience with manual expense tracking across 38 receipts in spreadsheets - a process that doesn't scale and misses valuable spending patterns.

**Romanian Market Focus:** Local market understanding with native support for Romanian receipt formats, Lei currency, and popular local stores (Mega Image, Good Market, Pizza Hut, Roshen). Addresses underserved market where international apps don't understand local formats.

**AI-First Approach:** Near-perfect extraction accuracy required, especially for popular Romanian stores. Users can verify and correct extractions, with the system learning from edits to improve over time.

**Mobile-First Design:** PWA architecture enables home screen installation and camera integration for seamless receipt capture workflow.

## Constraints

- **Market**: Romanian market initially — Lei currency, local stores, Romanian receipt formats
- **Accuracy**: AI extraction must be near-perfect to build user trust, especially for major retailers
- **Performance**: Mobile-first requires fast load times and offline capability for photo capture

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Romanian market first | Local market with specific receipt formats, underserved by international apps | — Pending |
| Subscription model (19.99/39.99 Lei) | Recurring revenue model aligns with ongoing value delivery of insights | — Pending |
| PWA over native app | Faster development, easier deployment, still provides mobile-native experience | — Pending |
| AI extraction over manual entry | Core value proposition - eliminate tedious manual data entry | — Pending |

---
*Last updated: 2026-03-04 after initialization*