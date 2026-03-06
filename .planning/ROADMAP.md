# CartSense - Project Roadmap

**Created:** 2026-03-04  
**Core Value:** Transform the tedious manual process of tracking expenses into effortless insights by making receipt data capture and analysis as simple as taking a photo.

## Overview

This roadmap delivers CartSense as a comprehensive receipt intelligence platform for the Romanian market through 10 strategic phases. Each phase builds on previous work while delivering standalone value, ensuring steady progress toward market leadership.

**Total v1 Requirements:** 37  
**Development Timeline:** 9-12 months  
**Target Market:** Romanian consumers and businesses  

---

## Phase 1: Foundation & Core Authentication
**Goal:** Establish secure user foundation with passwordless authentication (email OTP + Google OAuth), Romanian/English localization with theme support, and a basic mobile camera capture entry point.

**Plans:** 5 plans in 4 waves

Plans:
- [x] 01-01-PLAN.md — Project scaffold with Next.js 15, Prisma schema, all dependencies
- [ ] 01-02-PLAN.md — Internationalization (Romanian/English) and theme system (light/dark/system)
- [ ] 01-03-PLAN.md — Clerk authentication with email OTP and Google OAuth
- [ ] 01-04-PLAN.md — App shell with sidebar, combined middleware, language/theme selectors
- [ ] 01-05-PLAN.md — Dashboard, Settings page, and camera capture flow

**Requirements:** [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, L10N-01, L10N-02, L10N-03, L10N-04, L10N-05, UX-04]

### Success Criteria
- Users can create accounts and authenticate securely across sessions
- Romanian language support with proper currency formatting
- Basic mobile camera integration works reliably
- Initial receipt data structure supports Romanian formats

### Requirements Mapped
- **AUTH-01**: User can create account with email OTP or Google OAuth
- **AUTH-02**: User can log in and stay logged in across sessions
- **AUTH-03**: ~~Password reset via email~~ N/A — passwordless authentication
- **AUTH-04**: User session persists across browser refresh
- **AUTH-05**: User can log out from any page
- **L10N-01**: System supports Lei (RON) as primary currency
- **L10N-02**: UI is available in Romanian with full diacritics support
- **L10N-03**: UI is available in English as secondary language
- **L10N-04**: User can switch between Romanian and English languages
- **L10N-05**: All currency formatting follows Romanian conventions
- **UX-04**: Mobile camera integration works smoothly

### Dependencies
- None (foundational phase)

### Estimated Duration
3-4 weeks

---

## Phase 2: Core Receipt Capture
**Goal:** Enable reliable receipt photo capture with basic AI extraction and manual verification

**Plans:** 4/4 plans complete

Plans:
- [ ] 02-01-PLAN.md — Receipt schema evolution + AI extraction service
- [x] 02-02-PLAN.md — Expanded FAB menu + upload flow
- [ ] 02-03-PLAN.md — Stacked cards verification UI components
- [ ] 02-04-PLAN.md — Receipt verification page + end-to-end wiring

**Requirements:** [RCPT-01, RCPT-02, RCPT-03, RCPT-04, RCPT-07]

### Success Criteria
- Users can capture receipt photos with mobile camera and auto-crop
- AI extracts basic receipt data (vendor, amount, date, tax) with 80%+ accuracy
- Manual data entry works as fallback when AI fails
- Users can verify and correct extracted data before saving

### Requirements Mapped
- **RCPT-01**: User can capture receipt photo using mobile camera with auto-crop
- **RCPT-02**: User can upload receipt images (PDF, JPG, PNG formats)
- **RCPT-03**: AI extracts vendor, amount, date, tax, payment type from receipt
- **RCPT-04**: User can manually enter receipt data when AI extraction fails
- **RCPT-07**: User can verify and correct AI-extracted data before saving

### Dependencies
- Phase 1 (Authentication foundation required)

### Estimated Duration
4-5 weeks

---

## Phase 3: Enhanced Processing & Categorization
**Goal:** Advanced receipt processing with automatic categorization and search capabilities

**Plans:** 5 plans in 3 waves

Plans:
- [ ] 03-01-PLAN.md — Schema evolution + category system (Category, ReceiptItem models, CRUD)
- [ ] 03-02-PLAN.md — Enhanced AI extraction + image processing (vendor recognition, auto-categorization, VAT, image enhancement)
- [ ] 03-03-PLAN.md — Receipt list redesign + category UX (date grouping, category chips, override picker, Settings management)
- [ ] 03-04-PLAN.md — Search & filtering (text search, filter chips, match highlighting)
- [ ] 03-05-PLAN.md — Batch upload (queue UI, per-receipt processing, summary with selective review)

**Requirements:** [RCPT-05, RCPT-06, RCPT-08, CAT-01, CAT-02, CAT-03, CAT-05, CAT-06]

### Success Criteria
- System auto-categorizes receipts into 15+ expense categories with 85%+ accuracy
- Users can create custom categories and override auto-categorization
- Receipt search works reliably by vendor, amount, category, and date
- Romanian VAT (19%) is handled correctly in all calculations

### Requirements Mapped
- **RCPT-05**: User can upload multiple receipts in batch for processing
- **RCPT-06**: System recognizes major Romanian vendors (Kaufland, Mega Image, eMAG, etc.)
- **RCPT-08**: System enhances receipt photo quality (brightness, contrast, crop)
- **CAT-01**: System auto-categorizes receipts into 15+ standard expense categories
- **CAT-02**: User can manually override auto-categorization
- **CAT-03**: User can create custom expense categories
- **CAT-04**: ~~User can flag receipts as business vs personal expenses~~ *(deferred)*
- **CAT-05**: User can search receipts by vendor, amount, category, or date
- **CAT-06**: System handles Romanian VAT (19% standard rate) correctly

### Dependencies
- Phase 2 (Basic capture must work)

### Estimated Duration
5-6 weeks

---

## Phase 4: PWA & Offline Capabilities
**Goal:** Transform web app into full Progressive Web App with offline functionality

### Success Criteria
- App installs on mobile devices as PWA with home screen icon
- Receipt capture works offline with automatic sync when online
- App loads quickly (<3 seconds) on mobile networks
- Offline data persists reliably and syncs without conflicts

### Requirements Mapped
- **UX-01**: App works as PWA (Progressive Web App) installable on mobile
- **UX-02**: App works offline for basic receipt capture
- **UX-03**: Data syncs automatically when connection restored
- **UX-05**: App loads quickly (<3 seconds) on mobile networks

### Dependencies
- Phase 2 (Core capture functionality required)

### Estimated Duration
3-4 weeks

---

## Phase 5: Analytics & Basic Reporting
**Goal:** Provide comprehensive expense analytics with export capabilities

### Success Criteria
- Users can view spending summaries by month, quarter, and year
- Category breakdowns display with clear visualizations
- Tax reports generate accurately for Romanian requirements
- Data exports work in PDF and Excel formats with proper Romanian formatting

### Requirements Mapped
- **ANLZ-01**: User can view expense summaries by month, quarter, and year
- **ANLZ-02**: User can view spending breakdowns by category with charts
- **ANLZ-03**: User can generate tax reports for preparation
- **ANLZ-04**: User can export data in PDF and Excel formats
- **ANLZ-08**: User can filter reports by custom date ranges

### Dependencies
- Phase 3 (Categorized receipts required for meaningful analytics)

### Estimated Duration
4-5 weeks

---

## Phase 6: AI Learning & Duplicate Detection
**Goal:** Implement machine learning improvements and intelligent duplicate detection

### Success Criteria
- AI learns from user corrections to improve categorization accuracy over time
- System reliably detects and flags duplicate receipts with 95%+ accuracy
- Categorization accuracy improves to 90%+ for frequent users
- User correction workflows are streamlined and efficient

### Requirements Mapped
- **CAT-07**: AI learns user categorization preferences over time
- **CAT-08**: System detects and flags duplicate receipts

### Dependencies
- Phase 3 (Categorization system required)
- Phase 5 (Historical data needed for learning)

### Estimated Duration
4-5 weeks

---

## Phase 7: Subscription Management
**Goal:** Implement freemium model with subscription tiers and usage tracking

### Success Criteria
- Free tier users can process limited receipts per month with clear limits
- Paid subscription upgrades work smoothly with Romanian payment methods
- Usage tracking provides accurate limits and notifications
- Subscription management settings are intuitive and comprehensive

### Requirements Mapped
- **SUB-01**: User can sign up for free tier (limited receipts per month)
- **SUB-02**: User can upgrade to paid subscription
- **SUB-03**: User can manage subscription settings
- **SUB-04**: System tracks usage limits for free tier
- **SUB-05**: User receives notifications when approaching limits

### Dependencies
- Phase 1 (User authentication required)
- Phase 2 (Receipt processing required for usage tracking)

### Estimated Duration
3-4 weeks

---

## Phase 8: Advanced Analytics & Budgeting
**Goal:** Provide sophisticated spending insights and budgeting tools

### Success Criteria
- Spending trend analysis shows meaningful month-over-month insights
- Users can set budgets and track actual vs budgeted spending
- Product price tracking works across stores and time periods
- AI-generated spending insights provide actionable recommendations

### Requirements Mapped
- **ANLZ-05**: User can view spending trend analysis with month-over-month insights
- **ANLZ-06**: User can set budgets and track actual vs budget spending
- **ANLZ-07**: User can track product price changes over time
- **ANLZ-09**: System provides spending insights ("You spent 20% more on groceries this month")

### Dependencies
- Phase 5 (Basic analytics required)
- Phase 6 (AI learning enables better insights)

### Estimated Duration
5-6 weeks

---

## Phase 9: Performance Optimization & Polish
**Goal:** Optimize app performance and refine user experience for production scale

### Success Criteria
- App consistently loads in under 3 seconds on 3G networks
- Receipt processing completes in under 5 seconds for standard receipts
- UI animations are smooth and responsive across all devices
- Error handling provides clear, actionable feedback to users

### Requirements Mapped
- Performance optimizations for existing UX requirements
- Enhanced error handling for all receipt processing workflows
- Mobile responsiveness improvements
- Accessibility compliance for Romanian and English interfaces

### Dependencies
- All previous phases (comprehensive optimization requires complete feature set)

### Estimated Duration
3-4 weeks

---

## Phase 10: Production Launch Preparation
**Goal:** Final preparation for production launch with monitoring and compliance

### Success Criteria
- GDPR compliance audit completed and verified
- Production monitoring and alerting systems operational
- Romanian market testing completed with positive feedback
- Documentation and support systems ready for public users

### Requirements Mapped
- Final compliance verification for all features
- Production infrastructure setup
- User documentation in Romanian and English
- Customer support system implementation

### Dependencies
- All previous phases (complete feature set required)

### Estimated Duration
2-3 weeks

---

## Timeline Summary

| Phase | Duration | Cumulative | Key Deliverables |
|-------|----------|------------|------------------|
| 1: Foundation | 3-4 weeks | 3-4 weeks | Authentication, Romanian localization |
| 2: Core Capture | 4-5 weeks | 7-9 weeks | Receipt photo capture, AI extraction |
| 3: Enhanced Processing | 5-6 weeks | 12-15 weeks | Categorization, vendor recognition |
| 4: PWA & Offline | 3-4 weeks | 15-19 weeks | Mobile app experience |
| 5: Analytics | 4-5 weeks | 19-24 weeks | Reporting and exports |
| 6: AI Learning | 4-5 weeks | 23-29 weeks | Smart categorization |
| 7: Subscription | 3-4 weeks | 26-33 weeks | Freemium model |
| 8: Advanced Analytics | 5-6 weeks | 31-39 weeks | Budgeting and insights |
| 9: Optimization | 3-4 weeks | 34-43 weeks | Performance polish |
| 10: Launch Prep | 2-3 weeks | 36-46 weeks | Production readiness |

**Total Estimated Duration:** 36-46 weeks (9-12 months)

---

## Success Metrics by Phase

### Technical Metrics
- **OCR Accuracy:** 80% (Phase 2) → 90% (Phase 6) → 95% (Phase 8)
- **Processing Speed:** <10s (Phase 2) → <5s (Phase 9) → <3s (Phase 10)
- **App Performance:** <5s load (Phase 4) → <3s load (Phase 9)
- **Uptime:** 99% (Phase 4) → 99.9% (Phase 10)

### User Experience Metrics
- **User Retention:** 40% (Phase 5) → 60% (Phase 8) → 70% (Phase 10)
- **Feature Adoption:** Core features 80%+ (Phase 5) → Advanced features 50%+ (Phase 8)
- **User Satisfaction:** 4.0+ stars (Phase 5) → 4.5+ stars (Phase 10)

### Business Metrics
- **Freemium Conversion:** 10% (Phase 7) → 15% (Phase 8) → 20% (Phase 10)
- **Romanian Market Share:** Top 5 (Phase 8) → Top 3 (Phase 10)
- **Revenue:** €10K ARR (Phase 8) → €50K ARR (Phase 10)

---

## Risk Mitigation

### High Priority Risks
1. **OCR Accuracy on Romanian Receipts**
   - Mitigation: Romanian training dataset, manual review queues
   - Monitored in: Phases 2, 3, 6

2. **GDPR Compliance Gaps**
   - Mitigation: EU-only infrastructure, privacy by design
   - Verified in: Phases 1, 10

3. **User Adoption & Retention**
   - Mitigation: Progressive onboarding, immediate value
   - Addressed in: Phases 4, 7, 8

### Medium Priority Risks
4. **Performance at Scale**
   - Mitigation: Async processing, horizontal scaling design
   - Addressed in: Phases 4, 9

5. **Romanian Payment Integration**
   - Mitigation: Multiple payment providers, local banking partnerships
   - Implemented in: Phase 7

---

## Dependencies & Critical Path

### External Dependencies
- **AI Service:** Claude 3.5 Sonnet availability and pricing
- **Payment Processing:** Stripe Romanian market support
- **Authentication:** Clerk GDPR compliance and Romanian localization
- **Infrastructure:** Vercel EU region performance and reliability

### Internal Dependencies
- **Phases 1-2:** Critical path for all subsequent features
- **Phase 3:** Required for meaningful analytics (Phase 5)
- **Phase 5:** Required for advanced features (Phase 8)
- **All phases:** Required for production launch (Phase 10)

---

## Resource Allocation

### Development Team Structure
- **Frontend Developer:** UI/UX, PWA implementation, Romanian localization
- **Backend Developer:** API design, database optimization, AI integration
- **DevOps Engineer:** Infrastructure, deployment, monitoring
- **Product Owner:** Requirements refinement, user testing coordination

### Skill Requirements by Phase
- **Phases 1-4:** Full-stack development, mobile PWA expertise
- **Phases 5-6:** Data visualization, machine learning integration
- **Phases 7-8:** Payment systems, analytics platforms
- **Phases 9-10:** Performance optimization, production operations

---

*Last updated: 2026-03-04*
*Next review: After Phase 2 completion*