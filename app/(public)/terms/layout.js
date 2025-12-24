export const metadata = {
  title: 'Terms of Service | TextPad - Online Text Editor',
  description: 'TextPad Terms of Service. Read our terms and conditions for using our online text editor, including user rights, prohibited uses, and service limitations. Understand your rights and responsibilities when using TextPad.',
  keywords: 'terms of service, terms and conditions, user agreement, textpad terms, online editor terms, legal terms',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service | TextPad',
    description: 'TextPad Terms of Service. Read our terms and conditions for using our online text editor, including user rights, prohibited uses, and service limitations.',
    type: 'website',
    url: '/terms',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | TextPad',
    description: 'TextPad Terms of Service. Read our terms and conditions for using our online text editor.',
  },
}

export default function TermsLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Terms of Service',
            description: 'TextPad Terms of Service. Read our terms and conditions for using our online text editor.',
            url: '/terms',
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

