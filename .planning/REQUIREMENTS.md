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
- [ ] **RCPT-06**: System recognizes major Romanian vendors (Kaufland, Mega Image, eMAG, etc.)
- [ ] **RCPT-07**: User can verify and correct AI-extracted data before saving
- [ ] **RCPT-08**: System enhances receipt photo quality (brightness, contrast, crop)

### Categorization

- [ ] **CAT-01**: System auto-categorizes receipts into 15+ standard expense categories
- [ ] **CAT-02**: User can manually override auto-categorization
- [ ] **CAT-03**: User can create custom expense categories
- [ ] **CAT-04**: User can flag receipts as business vs personal expenses
- [ ] **CAT-05**: User can search receipts by vendor, amount, category, or date
- [ ] **CAT-06**: System correctly handles Romanian VAT, including standard (19%), reduced (e.g., 9%, 5%), and VAT-exempt lines, with support for multiple VAT rates per receipt and VAT breakdown at receipt level
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

| Requirement | Phase | Status | Description |
|-------------|-------|--------|-------------|
| AUTH-01 | Phase 1: Foundation | Pending | User can create account with email and password |
| AUTH-02 | Phase 1: Foundation | Pending | User can log in and stay logged in across sessions |
| AUTH-03 | Phase 1: Foundation | Pending | User can reset password via email link |
| AUTH-04 | Phase 1: Foundation | Pending | User session persists across browser refresh |
| AUTH-05 | Phase 1: Foundation | Pending | User can log out from any page |
| RCPT-01 | Phase 2: Core Capture | Pending | User can capture receipt photo using mobile camera with auto-crop |
| RCPT-02 | Phase 2: Core Capture | Pending | User can upload receipt images (PDF, JPG, PNG formats) |
| RCPT-03 | Phase 2: Core Capture | Pending | AI extracts vendor, amount, date, tax, payment type from receipt |
| RCPT-04 | Phase 2: Core Capture | Pending | User can manually enter receipt data when AI extraction fails |
| RCPT-07 | Phase 2: Core Capture | Pending | User can verify and correct AI-extracted data before saving |
| RCPT-05 | Phase 3: Enhanced Processing | Pending | User can upload multiple receipts in batch for processing |
| RCPT-06 | Phase 3: Enhanced Processing | Pending | System recognizes major Romanian vendors |
| RCPT-08 | Phase 3: Enhanced Processing | Pending | System enhances receipt photo quality |
| CAT-01 | Phase 3: Enhanced Processing | Pending | System auto-categorizes receipts into 15+ standard expense categories |
| CAT-02 | Phase 3: Enhanced Processing | Pending | User can manually override auto-categorization |
| CAT-03 | Phase 3: Enhanced Processing | Pending | User can create custom expense categories |
| CAT-04 | Phase 3: Enhanced Processing | Pending | User can flag receipts as business vs personal expenses |
| CAT-05 | Phase 3: Enhanced Processing | Pending | User can search receipts by vendor, amount, category, or date |
| CAT-06 | Phase 3: Enhanced Processing | Pending | System handles Romanian VAT (19% standard rate) correctly |
| UX-01 | Phase 4: PWA & Offline | Pending | App works as PWA installable on mobile |
| UX-02 | Phase 4: PWA & Offline | Pending | App works offline for basic receipt capture |
| UX-03 | Phase 4: PWA & Offline | Pending | Data syncs automatically when connection restored |
| UX-05 | Phase 4: PWA & Offline | Pending | App loads quickly (<3 seconds) on mobile networks |
| ANLZ-01 | Phase 5: Analytics & Reporting | Pending | User can view expense summaries by month, quarter, and year |
| ANLZ-02 | Phase 5: Analytics & Reporting | Pending | User can view spending breakdowns by category with charts |
| ANLZ-03 | Phase 5: Analytics & Reporting | Pending | User can generate tax reports for preparation |
| ANLZ-04 | Phase 5: Analytics & Reporting | Pending | User can export data in PDF and Excel formats |
| ANLZ-08 | Phase 5: Analytics & Reporting | Pending | User can filter reports by custom date ranges |
| CAT-07 | Phase 6: AI Learning | Pending | AI learns user categorization preferences over time |
| CAT-08 | Phase 6: AI Learning | Pending | System detects and flags duplicate receipts |
| SUB-01 | Phase 7: Subscription | Pending | User can sign up for free tier (limited receipts per month) |
| SUB-02 | Phase 7: Subscription | Pending | User can upgrade to paid subscription |
| SUB-03 | Phase 7: Subscription | Pending | User can manage subscription settings |
| SUB-04 | Phase 7: Subscription | Pending | System tracks usage limits for free tier |
| SUB-05 | Phase 7: Subscription | Pending | User receives notifications when approaching limits |
| ANLZ-05 | Phase 8: Advanced Analytics | Pending | User can view spending trend analysis with month-over-month insights |
| ANLZ-06 | Phase 8: Advanced Analytics | Pending | User can set budgets and track actual vs budget spending |
| ANLZ-07 | Phase 8: Advanced Analytics | Pending | User can track product price changes over time |
| ANLZ-09 | Phase 8: Advanced Analytics | Pending | System provides spending insights |
| L10N-01 | Phase 1: Foundation | Pending | System supports Lei (RON) as primary currency |
| L10N-02 | Phase 1: Foundation | Pending | UI is available in Romanian with full diacritics support |
| L10N-03 | Phase 1: Foundation | Pending | UI is available in English as secondary language |
| L10N-04 | Phase 1: Foundation | Pending | User can switch between Romanian and English languages |
| L10N-05 | Phase 1: Foundation | Pending | All currency formatting follows Romanian conventions |
| UX-04 | Phase 1: Foundation | Pending | Mobile camera integration works smoothly |

**Coverage Analysis:**
- **v1 requirements:** 37 total
- **Mapped to phases:** 37 (100%)
- **Unmapped:** 0 ✓
- **Phase distribution:** 1(11) → 2(5) → 3(6) → 4(4) → 5(5) → 6(2) → 7(5) → 8(4)

**Phase Requirement Density:**
- **Heaviest phases:** Phase 1 (11 reqs), Phase 3 (6 reqs)
- **Lightest phases:** Phase 6 (2 reqs), Phase 4 (4 reqs)
- **Balanced distribution:** Core functionality front-loaded, advanced features spread across later phases

---
*Requirements defined: 2026-03-04*  
*Last updated: 2026-03-04 after comprehensive roadmap creation*  
*Next review: After Phase 1 completion*