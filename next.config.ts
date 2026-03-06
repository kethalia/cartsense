import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '11mb', // Raw file upload (no base64 bloat) — 10MB max + FormData overhead
    },
  },

}

export default withNextIntl(nextConfig)
