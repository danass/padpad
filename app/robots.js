export default function robots() {
  const baseUrl = 'https://www.textpad.cloud'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/migrate/',
          '/_next/',
          '/static/',
          '/drive',
          '/settings',
          '/auth',
          '/doc/',
          '/migrate',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}



