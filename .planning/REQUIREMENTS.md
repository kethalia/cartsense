# Requirements: CartSense

**Defined:** 2026-03-04
**Core Value:** Transform the tedious manual process of tracking expenses into effortless insights by making receipt data capture and analysis as simple as taking a photo.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can create account with email and password
- [ ] **AUTH-02**: User can log in and stay logged in across sessions
- [ ] **AUTH-03**: User can reset password via email link
- [ ] **AUTH-04**: User session persists across browser refresh
- [ ] **AUTH-05**: User can log out from any page

### Receipt Capture

- [ ] **RCPT-01**: User can capture receipt photo using mobile camera with auto-crop
- [ ] **RCPT-02**: User can upload receipt images (PDF, JPG, PNG formats)
- [ ] **RCPT-03**: AI extracts vendor, amount, date, tax, payment type from receipt
- [ ] **RCPT-04**: User can manually enter receipt data when AI extraction fails
- [ ] **RCPT-05**: User can upload multiple receipts in batch for processing
- [ ] **RCPT-06**: System recognizes major Romanian vendors (Kaufland, Mega Image, eMag, etc.)
- [ ] **RCPT-07**: User can verify and correct AI-extracted data before saving
- [ ] **RCPT-08**: System enhances receipt photo quality (brightness, contrast, crop)

### Categorization

- [ ] **CAT-01**: System auto-categorizes receipts into 15+ standard expense categories
- [ ] **CAT-02**: User can manually override auto-categorization
- [ ] **CAT-03**: User can create custom expense categories
- [ ] **CAT-04**: User can flag receipts as business vs personal expenses
- [ ] **CAT-05**: User can search receipts by vendor, amount, category, or date
- [ ] **CAT-06**: System handles Romanian VAT (19% standard rate) correctly
- [ ] **CAT-07**: AI learns user categorization preferences over time
- [ ] **CAT-08**: System detects and flags duplicate receipts

### Analytics & Reporting

- [ ] **ANLZ-01**: User can view expense summaries by month, quarter, and year
- [ ] **ANLZ-02**: User can view spending breakdowns by category with charts
- [ ] **ANLZ-03**: User can generate tax reports for preparation
- [ ] **ANLZ-04**: User can export data in PDF and Excel formats
- [ ] **ANLZ-05**: User can view spending trend analysis with month-over-month insights
- [ ] **ANLZ-06**: User can set budgets and track actual vs budget spending
- [ ] **ANLZ-07**: User can track product price changes over time
- [ ] **ANLZ-08**: User can filter reports by custom date ranges
- [ ] **ANLZ-09**: System provides spending insights ("You spent 20% more on groceries this month")

### Localization

- [ ] **L10N-01**: System supports Lei (RON) as primary currency
- [ ] **L10N-02**: UI is available in Romanian with full diacritics support
- [ ] **L10N-03**: UI is available in English as secondary language
- [ ] **L10N-04**: User can switch between Romanian and English languages
- [ ] **L10N-05**: All currency formatting follows Romanian conventions

### User Experience

- [ ] **UX-01**: App works as PWA (Progressive Web App) installable on mobile
- [ ] **UX-02**: App works offline for basic receipt capture
- [ ] **UX-03**: Data syncs automatically when connection restored
- [ ] **UX-04**: Mobile camera integration works smoothly
- [ ] **UX-05**: App loads quickly (<3 seconds) on mobile networks

### Subscription Management

- [ ] **SUB-01**: User can sign up for free tier (limited receipts per month)
- [ ] **SUB-02**: User can upgrade to paid subscription
- [ ] **SUB-03**: User can manage subscription settings
- [ ] **SUB-04**: System tracks usage limits for free tier
- [ ] **SUB-05**: User receives notifications when approaching limits

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Integrations

- **INTG-01**: Connect to Romanian banking APIs (BRD, BCR, ING, Raiffeisen)
- **INTG-02**: ANAF integration for government tax reporting
- **INTG-03**: Integration with Romanian accounting software
- **INTG-04**: Email receipt parsing from Gmail/Outlook

### Enhanced Features

- **ENH-01**: Voice note annotations for receipts
- **ENH-02**: GPS location tagging for receipts
- **ENH-03**: Real-time expense alerts and notifications
- **ENH-04**: Team/family expense sharing
- **ENH-05**: Handwritten receipt OCR support
- **ENH-06**: Multi-line item extraction from detailed receipts

### Business Features

- **BIZ-01**: Multi-company expense tracking
- **BIZ-02**: Advanced approval workflows
- **BIZ-03**: Role-based permissions
- **BIZ-04**: API access for third-party integrations

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Cryptocurrency tracking | Too niche, adds complexity without clear value |
| Investment portfolio integration | Outside core receipt intelligence use case |
| Social sharing features | Privacy concerns with financial data |
| Blockchain/Web3 features | Buzzword-driven, no clear value proposition |
| Hardware scanner integration | Mobile-first approach is sufficient |
| Multi-country support (v1) | Romanian market focus first, expand later |
| Real-time store price comparison | Build internal database first, API integration later |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| RCPT-01 | Phase 1 | Pending |
| RCPT-02 | Phase 1 | Pending |
| RCPT-03 | Phase 1 | Pending |
| RCPT-04 | Phase 1 | Pending |
| RCPT-05 | Phase 2 | Pending |
| RCPT-06 | Phase 2 | Pending |
| RCPT-07 | Phase 1 | Pending |
| RCPT-08 | Phase 2 | Pending |
| CAT-01 | Phase 2 | Pending |
| CAT-02 | Phase 2 | Pending |
| CAT-03 | Phase 2 | Pending |
| CAT-04 | Phase 2 | Pending |
| CAT-05 | Phase 2 | Pending |
| CAT-06 | Phase 2 | Pending |
| CAT-07 | Phase 3 | Pending |
| CAT-08 | Phase 3 | Pending |
| ANLZ-01 | Phase 3 | Pending |
| ANLZ-02 | Phase 3 | Pending |
| ANLZ-03 | Phase 3 | Pending |
| ANLZ-04 | Phase 3 | Pending |
| ANLZ-05 | Phase 4 | Pending |
| ANLZ-06 | Phase 4 | Pending |
| ANLZ-07 | Phase 4 | Pending |
| ANLZ-08 | Phase 3 | Pending |
| ANLZ-09 | Phase 4 | Pending |
| L10N-01 | Phase 1 | Pending |
| L10N-02 | Phase 1 | Pending |
| L10N-03 | Phase 1 | Pending |
| L10N-04 | Phase 1 | Pending |
| L10N-05 | Phase 1 | Pending |
| UX-01 | Phase 2 | Pending |
| UX-02 | Phase 2 | Pending |
| UX-03 | Phase 2 | Pending |
| UX-04 | Phase 1 | Pending |
| UX-05 | Phase 2 | Pending |
| SUB-01 | Phase 3 | Pending |
| SUB-02 | Phase 3 | Pending |
| SUB-03 | Phase 3 | Pending |
| SUB-04 | Phase 3 | Pending |
| SUB-05 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 37 total
- Mapped to phases: 37
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after initial definition*