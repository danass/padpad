export const metadata = {
  title: 'Privacy Policy | TextPad - Online Text Editor',
  description: 'TextPad Privacy Policy. Learn how we collect, use, and protect your personal information when you use our online text editor service. We are committed to protecting your privacy and ensuring data security.',
  keywords: 'privacy policy, data protection, personal information, textpad privacy, online editor privacy, GDPR, data security',
  viewport: 'width=device-width, initial-scale=1',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | TextPad',
    description: 'TextPad Privacy Policy. Learn how we collect, use, and protect your personal information when you use our online text editor service.',
    type: 'website',
    url: '/privacy',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | TextPad',
    description: 'TextPad Privacy Policy. Learn how we collect, use, and protect your personal information.',
  },
}

export default function PrivacyLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Privacy Policy',
            description: 'TextPad Privacy Policy. Learn how we collect, use, and protect your personal information.',
            url: '/privacy',
            publisher: {
              '@type': 'Organization',
              name: 'TextPad',
              url: 'https://textpad.cloud',
            },
          }),
        }}
      />
      {children}
    </>
  )
}

