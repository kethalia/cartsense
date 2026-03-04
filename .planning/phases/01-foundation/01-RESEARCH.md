# Phase 1: Foundation & Core Authentication - Research

**Researched:** 2026-03-04
**Domain:** Next.js 15 App Router + Clerk Auth + next-intl i18n + shadcn/ui + Camera Capture
**Confidence:** HIGH

## Summary

This research covers the six core technical domains needed for Phase 1: next-intl for i18n with App Router, Clerk authentication (email OTP + Google OAuth), the Clerk + next-intl middleware combination pattern, next-themes with shadcn/ui for theming, the shadcn sidebar component for navigation, and mobile camera capture patterns.

The ecosystem is mature and well-documented. All chosen technologies have official documentation for the exact patterns needed. The most complex integration point — combining Clerk and next-intl middleware — is explicitly documented by Clerk with a working code example. next-intl v4 is current and has first-class Next.js 15 App Router support. Clerk's latest SDK (v7+) uses `clerkMiddleware()` (not the deprecated `authMiddleware()`).

**Primary recommendation:** Use `clerkMiddleware()` as the outer wrapper that calls `createMiddleware(routing)` from next-intl as the return value. Use `localePrefix: 'as-needed'` so the default locale (English) has clean URLs. Configure next-themes with `attribute="class"` for Tailwind's `dark:` selector support.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Next.js 15 + TypeScript
- Tailwind CSS + shadcn/ui components
- Clerk for authentication (email OTP + Google OAuth only — no password management)
- PostgreSQL + Prisma ORM
- Vercel (EU region) / self-hosted deployment — keep both options viable
- AUTH-03 (password reset via email) is irrelevant — no passwords exist
- AUTH-01 reframed: "User can create account with email OTP or Google OAuth"
- Single unified auth screen — no separate sign-up vs login distinction (passwordless makes them identical)
- Auth presented as dialog on desktop, drawer on mobile
- No extra information collected at sign-up — just authenticate. Name/avatar come from Google if available, otherwise blank
- After first login, land directly on the main dashboard (empty state). No onboarding tour or guided flow — empty states do the onboarding work
- Long-lived sessions (30 days). Only log out on explicit user action or 30-day inactivity
- Auto-detect language from browser locale. Romanian if browser is RO, English otherwise
- Language selector lives as a secondary item in the shadcn sidebar (not in header)
- Theme selector also in the sidebar as a secondary item alongside language
- Theme support from day one: light, dark, and system preference (three options)
- Language switch is instant — entire UI re-renders immediately, no page reload, no confirmation dialog
- shadcn sidebar as the main navigation component
- On mobile: off-canvas drawer triggered by hamburger menu
- Three screens in Phase 1: Dashboard (home), Settings (profile/language/theme), Camera capture
- Spacious and clean visual density — generous whitespace, large touch targets, card-based content areas
- Neutral color palette with a single accent color for primary actions
- Floating action button (FAB) at bottom-right of dashboard, always visible — receipt capture is the core action
- Tapping FAB opens the native camera viewfinder directly — no intermediate choice sheet
- After capture: quick preview screen with "Use this" and "Retake" buttons only
- After confirming: photo is saved, user sees "Receipt saved! Processing coming soon." success message, returns to dashboard
- Dashboard empty state updates to show captured receipt as a thumbnail/card

### Claude's Discretion
- Exact accent/brand color selection
- Loading skeleton and spinner designs
- Error state layouts and copy
- Sidebar item ordering and iconography
- Camera viewfinder overlay styling
- Empty state illustration style
- Exact spacing scale and typography choices

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can create account with email OTP or Google OAuth | Clerk email OTP custom flow, Google OAuth via Clerk Dashboard config |
| AUTH-02 | User can log in and stay logged in across sessions | Clerk session management, 30-day session token configuration |
| AUTH-03 | ~~Password reset via email~~ | IRRELEVANT — no passwords exist (locked decision) |
| AUTH-04 | User session persists across browser refresh | Clerk's built-in session token + cookie management handles this |
| AUTH-05 | User can log out from any page | Clerk `useClerk().signOut()` or `<SignOutButton>` component |
| L10N-01 | System supports Lei (RON) as primary currency | next-intl `useFormatter().number()` with `{style: 'currency', currency: 'RON'}` |
| L10N-02 | UI is available in Romanian with full diacritics support | next-intl message files with UTF-8 Romanian text |
| L10N-03 | UI is available in English as secondary language | next-intl `locales: ['ro', 'en']` with English as defaultLocale |
| L10N-04 | User can switch between Romanian and English languages | next-intl navigation `useRouter().replace()` with locale change |
| L10N-05 | All currency formatting follows Romanian conventions | next-intl `useFormatter()` with `ro` locale auto-uses Romanian decimal/grouping |
| UX-04 | Mobile camera integration works smoothly | `<input type="file" accept="image/*" capture="environment">` pattern |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.x | React framework with App Router | Project foundation (locked decision) |
| @clerk/nextjs | 7.x (latest) | Authentication provider | Email OTP + Google OAuth, GDPR compliant (locked decision) |
| next-intl | 4.8.x | Internationalization | Best Next.js App Router i18n library, ICU message syntax |
| next-themes | 0.4.x | Theme management (light/dark/system) | Standard for shadcn/ui dark mode, no flash on load |
| tailwindcss | 4.x | Utility-first CSS | Works with shadcn/ui (locked decision) |
| shadcn/ui | latest | Component library | Sidebar, Dialog, Drawer, Button components (locked decision) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @prisma/client | 6.x | Database ORM | Database schema and queries (locked decision) |
| sonner | latest | Toast notifications | "Receipt saved!" success messages |
| lucide-react | latest | Icon library | Sidebar icons, FAB camera icon, nav icons |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-intl | next-i18next | next-i18next is for Pages Router; next-intl is the standard for App Router |
| next-themes | Custom CSS | next-themes handles system preference, no-flash, cookie sync across tabs |
| Clerk prebuilt components | Custom auth UI | Prebuilt is faster but user wants dialog/drawer pattern — use Clerk's hooks for custom flows |

**Installation:**
```bash
npm install next-intl next-themes @clerk/nextjs
npx shadcn@latest add sidebar dialog drawer button input-otp sheet
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout (minimal — passes children through)
│   └── [locale]/
│       ├── layout.tsx          # Locale layout with ClerkProvider + NextIntlClientProvider + ThemeProvider
│       ├── auth/
│       │   └── page.tsx        # Auth page (public — dialog/drawer with email OTP + Google)
│       ├── sso-callback/
│       │   └── page.tsx        # Google OAuth callback handler
│       └── (app)/              # Route group for authenticated pages (has sidebar)
│           ├── layout.tsx      # Protected layout with SidebarProvider + AppSidebar
│           ├── page.tsx        # Dashboard (home)
│           └── settings/
│               └── page.tsx    # Settings page
├── components/
│   ├── auth/
│   │   ├── auth-screen.tsx     # Auth dialog (desktop) / drawer (mobile)
│   │   ├── email-otp-form.tsx  # Email OTP sign-in/sign-up flow
│   │   └── google-auth-button.tsx
│   ├── layout/
│   │   ├── app-sidebar.tsx     # Main sidebar navigation
│   │   ├── locale-switcher.tsx # Language selector (sidebar footer)
│   │   └── theme-toggle.tsx    # Theme selector (sidebar footer)
│   ├── capture/
│   │   ├── fab-button.tsx      # Floating action button for camera
│   │   ├── camera-capture.tsx  # Camera capture component
│   │   ├── capture-flow.tsx    # Capture state machine orchestrator
│   │   └── photo-preview.tsx   # Preview with Use this / Retake
│   ├── dashboard/
│   │   ├── empty-state.tsx     # Empty state for no receipts
│   │   └── receipt-card.tsx    # Receipt thumbnail card
│   ├── theme-provider.tsx      # next-themes ThemeProvider wrapper
│   └── ui/                     # shadcn/ui generated components
├── i18n/
│   ├── routing.ts              # defineRouting config
│   ├── request.ts              # getRequestConfig for server
│   └── navigation.ts           # createNavigation wrapper
├── messages/
│   ├── en.json                 # English translations
│   └── ro.json                 # Romanian translations
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   └── utils.ts                # Utility functions
└── middleware.ts                # Combined Clerk + next-intl middleware (Next.js 15)
```

### Pattern 1: Combined Clerk + next-intl Middleware (CRITICAL)
**What:** The single most important integration pattern — combining Clerk auth and next-intl locale routing in one middleware file.
**When to use:** Always — this is the foundation of the entire app.
**Source:** Clerk official docs — "Combine Middleware" section
```typescript
// src/middleware.ts (Next.js 15 — Next.js 16+ renames this to proxy.ts)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// IMPORTANT: With localePrefix: 'as-needed', the default locale (English) has NO
// prefix — routes are /dashboard, not /en/dashboard. Include BOTH prefixed and
// unprefixed patterns to protect routes in all locales.
const isProtectedRoute = createRouteMatcher([
  '/:locale/dashboard(.*)',
  '/:locale/settings(.*)',
  '/:locale/capture(.*)',
  '/dashboard(.*)',
  '/settings(.*)',
  '/capture(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
  return intlMiddleware(req)
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

**IMPORTANT NOTE:** Next.js 16+ renamed `middleware.ts` to `proxy.ts`. For Next.js 15, the file is still called `middleware.ts`. The code is identical — only the filename changes.

### Pattern 2: next-intl Routing Configuration
**What:** Define supported locales, default locale, and locale detection behavior.
**Source:** next-intl official docs
```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'ro'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',  // No prefix for English (default), /ro/ prefix for Romanian
  localeDetection: true,       // Auto-detect from Accept-Language header + cookie
})
```

```typescript
// src/i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
```

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Europe/Bucharest',
    formats: {
      number: {
        currency: {
          style: 'currency',
          currency: 'RON',
        },
      },
    },
  }
})
```

### Pattern 3: Root Layout with All Providers
**What:** Compose ClerkProvider, NextIntlClientProvider, and ThemeProvider correctly.
```typescript
// src/app/[locale]/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { ThemeProvider } from '@/components/theme-provider'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ClerkProvider>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
```

### Pattern 4: Theme Provider Setup (shadcn/ui standard)
**What:** next-themes integration with Tailwind's `dark:` selector.
**Source:** shadcn/ui Dark Mode docs
```typescript
// src/components/theme-provider.tsx
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**Tailwind configuration:** Tailwind CSS v4 uses `darkMode: 'selector'` (or `'class'` for v3.4.1+). With `attribute="class"` on the ThemeProvider, Tailwind's `dark:` utility classes work automatically.

### Pattern 5: Currency Formatting for RON
**What:** Format Romanian Lei (RON) using next-intl's Intl.NumberFormat wrapper.
**Source:** next-intl number formatting docs
```typescript
import { useFormatter } from 'next-intl'

function PriceDisplay({ amount }: { amount: number }) {
  const format = useFormatter()

  // With ro locale: "123,45 RON" (Romanian conventions)
  // With en locale: "RON 123.45" (English conventions)
  return <span>{format.number(amount, { style: 'currency', currency: 'RON' })}</span>
}

// Or using global format defined in i18n/request.ts:
function PriceDisplayGlobal({ amount }: { amount: number }) {
  const format = useFormatter()
  return <span>{format.number(amount, 'currency')}</span>
}
```

**Romanian number conventions:**
- Decimal separator: `,` (comma)
- Thousands separator: `.` (period)
- Currency symbol position: after number
- Example: `1.234,56 RON`

### Pattern 6: shadcn Sidebar with Mobile Drawer
**What:** Responsive sidebar that collapses to an off-canvas drawer on mobile.
**Source:** shadcn/ui Sidebar docs
```typescript
// src/app/[locale]/layout.tsx (inside the providers)
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

// Inside the layout's JSX:
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <header>
      <SidebarTrigger /> {/* Hamburger menu on mobile */}
    </header>
    <main>{children}</main>
  </SidebarInset>
</SidebarProvider>
```

```typescript
// src/components/app-sidebar.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Home, Settings, Camera } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

export function AppSidebar() {
  const t = useTranslations('Sidebar')

  return (
    <Sidebar collapsible="offcanvas"> {/* offcanvas = mobile drawer */}
      <SidebarHeader>
        {/* App logo/name */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/"><Home /><span>{t('dashboard')}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings"><Settings /><span>{t('settings')}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* Language selector + Theme selector as secondary items */}
        <LocaleSwitcher />
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
```

**Key sidebar configuration:**
- `collapsible="offcanvas"` — slides in from the side on mobile (matches "off-canvas drawer" requirement)
- `collapsible="icon"` — collapses to icons on desktop
- `SidebarInset` wraps the main content when using `variant="inset"`
- Mobile state is managed via `useSidebar()` hook: `openMobile`, `setOpenMobile`, `isMobile`
- CSS variables for width: `--sidebar-width: 16rem`, `--sidebar-width-mobile: 18rem`

### Pattern 7: Mobile Camera Capture
**What:** Open native camera using HTML file input — most reliable cross-platform approach.
```typescript
// src/components/camera-capture.tsx
'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

export function CameraCapture({ onCapture }: { onCapture: (file: File) => void }) {
  const t = useTranslations('Camera')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onCapture(file)
    }
  }

  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      capture="environment"  // Opens rear camera directly
      onChange={handleChange}
      className="hidden"
    />
  )
}
```

### Pattern 8: Clerk Email OTP Custom Flow
**What:** Passwordless auth using email verification codes — Clerk's custom flow API.
**Source:** Clerk docs — custom-flows/email-sms-otp
```typescript
'use client'
import { useSignUp, useSignIn } from '@clerk/nextjs'

// Sign-up with email OTP:
// 1. signUp.create({ emailAddress })
// 2. signUp.verifications.sendEmailCode()
// 3. signUp.verifications.verifyEmailCode({ code })
// 4. signUp.finalize({ navigate: ... })

// Sign-in with email OTP:
// 1. signIn.create({ identifier: emailAddress })
// 2. signIn.emailCode.sendCode({ emailAddress })
// 3. signIn.emailCode.verifyCode({ code })
// 4. signIn.finalize({ navigate: ... })
```

**IMPORTANT: Clerk SDK version matters.** The above API (`SignUpFuture`, `SignInFuture`, `.finalize()`) is for `@clerk/nextjs` v7+. The legacy API uses different method names.

### Pattern 9: Locale Switcher (Instant Switch)
**What:** Language switch that re-renders the entire UI immediately without page reload.
```typescript
// src/components/locale-switcher.tsx
'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function onChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    // Render buttons/select for 'en' and 'ro'
    // Call onChange with new locale value
    // Uses next-intl's router.replace which triggers a client-side navigation
  )
}
```

### Anti-Patterns to Avoid
- **Using `authMiddleware()` from Clerk:** Deprecated. Always use `clerkMiddleware()`.
- **Using `<SignedIn>` / `<SignedOut>` from Clerk:** Deprecated components. Use `<Show when="signed-in">` / `<Show when="signed-out">` instead.
- **Nesting ThemeProvider inside a client component that isn't properly wrapped:** ThemeProvider MUST be in a `'use client'` component but the root layout itself stays a server component.
- **Reading `theme` from `useTheme()` during SSR:** Will cause hydration mismatch. Always guard with a `mounted` state check.
- **Using `localePrefix: 'always'` with Clerk route matchers:** Route matchers need to include the `/:locale` prefix pattern. Use `'as-needed'` so the default locale doesn't need a prefix.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session management | Custom JWT + cookie logic | Clerk's built-in session tokens | Handles refresh, expiry, multi-tab sync, secure cookies |
| Locale detection | Custom Accept-Language parser | next-intl middleware `localeDetection: true` | Handles browser locale, cookie persistence, redirect logic |
| Dark mode without flash | Custom script injection | next-themes | Injects script in `<head>` before paint, handles system preference |
| Number/currency formatting | Custom Intl.NumberFormat wrapper | next-intl `useFormatter()` | Locale-aware, handles all ICU patterns, SSR-safe |
| Sidebar responsive behavior | Custom drawer + media queries | shadcn Sidebar with `collapsible="offcanvas"` | Built-in mobile detection, keyboard shortcuts, state management |
| Camera access | MediaDevices API for simple capture | `<input type="file" capture="environment">` | Works without permissions API on most mobile browsers |

**Key insight:** Every item above has edge cases (browser compatibility, hydration, timezone offsets) that the libraries handle and custom code would miss.

## Common Pitfalls

### Pitfall 1: Middleware File Name
**What goes wrong:** Using `middleware.ts` vs `proxy.ts` incorrectly
**Why it happens:** Next.js 16 renamed `middleware.ts` to `proxy.ts`. Clerk docs reference `proxy.ts` assuming latest Next.js.
**How to avoid:** For Next.js 15, use `middleware.ts`. For Next.js 16+, use `proxy.ts`. The code inside is identical.
**Warning signs:** Middleware not executing at all (404s on locale routes)

### Pitfall 2: Hydration Mismatch with next-themes
**What goes wrong:** Rendering theme-dependent UI on server causes React hydration warnings
**Why it happens:** Server doesn't know the user's theme preference (stored in localStorage/cookie)
**How to avoid:** Use the `mounted` pattern — don't render theme-dependent UI until `useEffect` confirms client mount. For theme toggle buttons, render a skeleton/placeholder initially.
**Warning signs:** Console warnings about "Expected server HTML to contain..."

### Pitfall 3: Clerk + next-intl Route Protection with Locale Prefix
**What goes wrong:** Protected routes don't match because Clerk's `createRouteMatcher` doesn't account for both prefixed and unprefixed paths
**Why it happens:** With `localePrefix: 'as-needed'`, the default locale (English) has NO prefix — paths are `/dashboard` not `/en/dashboard`. Non-default locales DO have a prefix — `/ro/dashboard`. The `/:locale/dashboard(.*)` pattern alone only matches when a locale segment is present.
**How to avoid:** Include BOTH prefixed and unprefixed patterns in `createRouteMatcher`: `['/:locale/dashboard(.*)', '/dashboard(.*)']`. Do this for every protected route.
**Warning signs:** Unauthenticated users can access protected routes when using the default locale (English)

### Pitfall 4: `setRequestLocale` Omission
**What goes wrong:** Pages opt into dynamic rendering unnecessarily
**Why it happens:** next-intl needs the locale for Server Components; without `setRequestLocale`, it reads from headers (dynamic)
**How to avoid:** Call `setRequestLocale(locale)` at the top of every layout and page that uses next-intl
**Warning signs:** Pages that should be statically rendered show "dynamic" in build output

### Pitfall 5: Camera Capture on iOS Safari
**What goes wrong:** `capture="environment"` is ignored or shows file picker instead of camera
**Why it happens:** iOS Safari requires the `accept="image/*"` attribute to be present alongside `capture`
**How to avoid:** Always include both: `accept="image/*" capture="environment"`. On iOS, this opens the camera. If the user explicitly wants to pick from gallery, they can use the camera UI's gallery option.
**Warning signs:** Users report seeing file picker instead of camera on iPhone

### Pitfall 6: ClerkProvider Must Wrap Everything
**What goes wrong:** Auth hooks return undefined, auth state not available
**Why it happens:** Components using `useAuth()`, `useSignIn()`, etc. are rendered outside ClerkProvider
**How to avoid:** Place `<ClerkProvider>` as the outermost provider in the root layout, wrapping NextIntlClientProvider and ThemeProvider
**Warning signs:** "useAuth can only be used within ClerkProvider" errors

### Pitfall 7: next-intl Messages Loading
**What goes wrong:** Messages are undefined in Client Components
**Why it happens:** NextIntlClientProvider doesn't receive messages
**How to avoid:** In the layout, use `const messages = await getMessages()` and pass to `<NextIntlClientProvider messages={messages}>`
**Warning signs:** Translation keys rendered as-is (e.g., "Dashboard.title" instead of "Dashboard")

### Pitfall 8: `suppressHydrationWarning` Location
**What goes wrong:** Hydration warnings flood the console
**Why it happens:** next-themes modifies the `<html>` element's `class` attribute before React hydrates
**How to avoid:** Add `suppressHydrationWarning` to the `<html>` tag. This only suppresses one level deep — intentional.
**Warning signs:** Warnings about `class` attribute mismatch on html element

## Code Examples

### Romanian Currency Formatting
```typescript
// Source: next-intl official docs + Intl.NumberFormat MDN
import { useFormatter } from 'next-intl'

function ReceiptAmount({ amount }: { amount: number }) {
  const format = useFormatter()

  // Romanian locale (ro): "1.234,56 RON"
  // English locale (en):  "RON 1,234.56"
  const formatted = format.number(amount, {
    style: 'currency',
    currency: 'RON',
  })

  return <span>{formatted}</span>
}
```

### Theme Toggle for Sidebar
```typescript
// Source: next-themes README + shadcn/ui Dark Mode docs
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-8 w-8" /> // Skeleton placeholder

  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  return (
    <div className="flex gap-1">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={theme === value ? 'bg-accent' : ''}
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}
```

### Clerk Email OTP Sign-In Flow (Simplified)
```typescript
// Source: Clerk custom-flows/email-sms-otp docs (adapted for email)
'use client'

import { useSignIn } from '@clerk/nextjs'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

export function EmailOTPSignIn() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()
  const t = useTranslations('Auth')

  async function handleSubmit(formData: FormData) {
    const emailAddress = formData.get('email') as string
    const { error } = await signIn.create({ identifier: emailAddress })
    if (error) return
    await signIn.emailCode.sendCode({ emailAddress })
  }

  async function handleVerify(formData: FormData) {
    const code = formData.get('code') as string
    await signIn.emailCode.verifyCode({ code })

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          const url = decorateUrl('/')
          router.push(url)
        },
      })
    }
  }

  // Render form based on signIn.status
  // ...
}
```

### Message File Structure
```json
// messages/en.json
{
  "Sidebar": {
    "navigation": "Navigation",
    "dashboard": "Dashboard",
    "settings": "Settings",
    "language": "Language",
    "theme": "Theme"
  },
  "Dashboard": {
    "title": "Dashboard",
    "emptyState": "No receipts yet. Tap the camera button to capture your first receipt!",
    "receiptSaved": "Receipt saved! Processing coming soon."
  },
  "Auth": {
    "signIn": "Sign in",
    "email": "Email address",
    "enterCode": "Enter verification code",
    "codeSent": "We sent a code to {email}",
    "verify": "Verify",
    "continueWithGoogle": "Continue with Google",
    "or": "or"
  },
  "Camera": {
    "capture": "Capture Receipt",
    "useThis": "Use this",
    "retake": "Retake",
    "saved": "Receipt saved!"
  },
  "Settings": {
    "title": "Settings",
    "language": "Language",
    "theme": "Theme"
  },
  "LocaleSwitcher": {
    "en": "English",
    "ro": "Română"
  }
}
```

```json
// messages/ro.json
{
  "Sidebar": {
    "navigation": "Navigare",
    "dashboard": "Panou principal",
    "settings": "Setări",
    "language": "Limbă",
    "theme": "Temă"
  },
  "Dashboard": {
    "title": "Panou principal",
    "emptyState": "Niciun bon încă. Apasă butonul camerei pentru a captura primul bon!",
    "receiptSaved": "Bon salvat! Procesarea vine în curând."
  },
  "Auth": {
    "signIn": "Autentificare",
    "email": "Adresă de email",
    "enterCode": "Introduceți codul de verificare",
    "codeSent": "Am trimis un cod la {email}",
    "verify": "Verifică",
    "continueWithGoogle": "Continuă cu Google",
    "or": "sau"
  },
  "Camera": {
    "capture": "Capturează bon",
    "useThis": "Folosește",
    "retake": "Refă",
    "saved": "Bon salvat!"
  },
  "Settings": {
    "title": "Setări",
    "language": "Limbă",
    "theme": "Temă"
  },
  "LocaleSwitcher": {
    "en": "English",
    "ro": "Română"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `authMiddleware()` (Clerk) | `clerkMiddleware()` | Clerk v5+ (2024) | Must use new API — old one is fully deprecated |
| `<SignedIn>` / `<SignedOut>` | `<Show when="signed-in">` / `<Show when="signed-out">` | Clerk v7 | New conditional rendering API |
| `middleware.ts` (Next.js) | `proxy.ts` (Next.js 16+) | Next.js 16 (2025) | Filename change only — verify which Next.js version is used |
| next-intl v3 | next-intl v4 | 2025 | New `defineRouting`, `createNavigation` APIs; breaking changes from v3 |
| Tailwind `darkMode: 'class'` | `darkMode: 'selector'` | Tailwind v3.4.1+ | More flexible but `'class'` still works; `'selector'` is recommended |
| Manual i18n middleware + Clerk | Official combined pattern | Clerk docs 2025 | Clerk now has official docs showing next-intl integration |

**Deprecated/outdated:**
- `authMiddleware` from Clerk — fully replaced by `clerkMiddleware`
- `<SignedIn>` / `<SignedOut>` components — replaced by `<Show>` component
- next-intl v3 APIs (`createSharedPathnamesNavigation`) — replaced by v4's `createNavigation`

## Mobile Camera Capture: `<input>` vs MediaDevices API

### Recommendation: Use `<input type="file" capture="environment">`

| Approach | Pros | Cons |
|----------|------|------|
| `<input type="file" accept="image/*" capture="environment">` | Works without permission prompts; native camera UI; reliable across iOS/Android; no JS needed | Less control over camera UI; no real-time viewfinder overlay |
| `navigator.mediaDevices.getUserMedia()` | Full camera control; real-time viewfinder; can add overlays | Requires permission prompt; complex error handling; iOS Safari quirks; not all features available in PWA |

**For Phase 1, use `<input>` approach because:**
1. The requirement is "opens the native camera viewfinder directly" — the input capture does exactly this
2. No need for custom viewfinder overlays in Phase 1
3. Works reliably on both iOS Safari and Android Chrome
4. No permission API complexity
5. Progressive enhancement: can upgrade to MediaDevices API in Phase 2 if custom overlays are needed

**Behavior by platform:**
- **iOS Safari:** `capture="environment"` opens camera directly; user can switch to front camera or gallery from within camera UI
- **Android Chrome:** Opens camera directly with rear camera
- **Desktop browsers:** Falls back to file picker (appropriate since desktop users would upload, not capture)

## Open Questions

1. **Clerk Dashboard Configuration for Email OTP**
   - What we know: Email OTP requires enabling "Email verification code" in Clerk Dashboard under User & Authentication
   - What's unclear: Exact steps for disabling password authentication while keeping email OTP + Google OAuth
   - Recommendation: Configure in Clerk Dashboard during setup — disable Password, enable Email verification code + Google OAuth social provider

2. **Next.js 15 vs 16 — Which is in use?**
   - What we know: Project specifies "Next.js 15". Clerk and next-intl docs now reference `proxy.ts` (Next.js 16 convention)
   - What's unclear: Whether to start with Next.js 15 (stable) or upgrade to 16
   - Recommendation: Use Next.js 15 with `middleware.ts`. All code patterns are identical — only filename differs. Can upgrade later.

3. **Clerk Session Duration Configuration**
   - What we know: User wants 30-day sessions. Clerk supports configurable session duration.
   - What's unclear: Whether session duration is set in Dashboard or via SDK configuration
   - Recommendation: Set in Clerk Dashboard under Sessions settings — "Session lifetime" to 30 days

4. **Receipt Image Storage (Phase 1)**
   - What we know: After capture, photo should be "saved" and shown as thumbnail on dashboard
   - What's unclear: Where to store images in Phase 1 (database blob, filesystem, cloud storage)
   - Recommendation: For Phase 1, use browser's local IndexedDB or convert to base64 in database. Real storage solution in Phase 2.

## Sources

### Primary (HIGH confidence)
- next-intl official docs v4 (next-intl.dev) — routing setup, number formatting, translations, configuration, routing/configuration
- Clerk official docs (clerk.com/docs) — clerkMiddleware, auth(), custom-flows/email-sms-otp, combine middleware pattern, Next.js quickstart
- shadcn/ui official docs (ui.shadcn.com) — sidebar component, dark mode/next setup
- next-themes GitHub README (github.com/pacocoursey/next-themes) — v0.4.6, ThemeProvider API, useTheme, hydration avoidance

### Secondary (MEDIUM confidence)
- npm registry (npmjs.com) — next-intl v4.8.3 current version verified
- Clerk LLM context file (clerk.com/docs/llms.txt) — confirms latest API patterns, `<Show>` component

### Tertiary (LOW confidence)
- Camera capture cross-browser behavior — based on MDN docs and general web platform knowledge, not tested on physical devices

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries are locked decisions with official docs confirming compatibility
- Architecture: HIGH — patterns sourced directly from official documentation of each library
- Middleware combination: HIGH — Clerk official docs have explicit next-intl integration example
- Pitfalls: HIGH — documented gotchas from official sources and common community issues
- Camera capture: MEDIUM — HTML input capture is well-documented but cross-browser behavior varies

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (30 days — stable ecosystem, unlikely to change significantly)
