import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const protectedPaths = ['/dashboard', '/settings']

function isProtectedPath(pathname: string): boolean {
  // Strip locale prefix if present (e.g. /ro/dashboard → /dashboard)
  const pathWithoutLocale = pathname.replace(/^\/(en|ro)/, '') || '/'
  return protectedPaths.some((p) => pathWithoutLocale.startsWith(p))
}

export default function middleware(req: NextRequest) {
  // Check auth for protected routes (cookie-based, fast)
  if (isProtectedPath(req.nextUrl.pathname)) {
    const session = getSessionCookie(req)
    if (!session) {
      const authUrl = new URL('/auth', req.url)
      return NextResponse.redirect(authUrl)
    }
  }

  // Run intl middleware for locale routing (rewrites / → /en, etc.)
  return intlMiddleware(req)
}

export const config = {
  matcher: [
    '/((?!api|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
