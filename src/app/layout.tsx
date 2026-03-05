import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CartSense',
  description: 'Receipt intelligence for the Romanian market',
}

// Root layout is minimal — the [locale] layout provides <html> and <body>
// with the correct lang attribute and all providers.
// Next.js requires these tags here for validation, but the locale layout
// overrides them with the proper lang attribute per locale.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
