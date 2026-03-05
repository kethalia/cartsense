import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  serverActions: {
    bodySizeLimit: '15mb', // Receipt images are base64-encoded (~33% larger than original)
  },
}

export default withNextIntl(nextConfig)
