import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { BODY_SIZE_LIMIT } from '@/lib/config'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: BODY_SIZE_LIMIT,
    },
  },
}

export default withNextIntl(nextConfig)
