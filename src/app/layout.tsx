import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import "./globals.css"

export const metadata: Metadata = {
  title: "CartSense",
  description: "Receipt intelligence for the Romanian market",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
