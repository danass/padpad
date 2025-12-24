/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to prevent double-mount issues with DOM manipulation
  allowedDevOrigins: ['192.168.1.50'],
  // Generate source maps for production to help with debugging
  // Note: This will increase build size but helps with debugging in production
  productionBrowserSourceMaps: true,
}

module.exports = nextConfig





