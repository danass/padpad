/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compress: true,
  allowedDevOrigins: ['192.168.1.50'],
  productionBrowserSourceMaps: true,
  async rewrites() {
    return [
      // PostHog reverse proxy - bypasses ad blockers
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
    ]
  },
}

module.exports = nextConfig





