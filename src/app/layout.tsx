import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CartSense',
  description: 'Receipt intelligence for the Romanian market',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
