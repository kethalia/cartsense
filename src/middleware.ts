import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Protected routes — use /:locale pattern to handle both prefixed and unprefixed
// With localePrefix: 'as-needed', the default locale (English) has NO prefix
const isProtectedRoute = createRouteMatcher([
  '/',
  '/:locale',
  '/:locale/dashboard(.*)',
  '/:locale/settings(.*)',
  '/:locale/capture(.*)',
  '/dashboard(.*)',
  '/settings(.*)',
  '/capture(.*)',
])

// Public routes that should not require auth
const isPublicRoute = createRouteMatcher([
  '/:locale/auth(.*)',
  '/auth(.*)',
  '/:locale/sso-callback(.*)',
  '/sso-callback(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
  return intlMiddleware(req)
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
