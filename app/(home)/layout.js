export const metadata = {
  title: 'Online Text Editor – Simple & Collaborative | Textpad',
  description: 'Simple online text editor to write, edit and share text instantly. No account required. Collaborative and fast.',
  keywords: 'text pad, online editor, text editor, cloud editor, document editor, text formatting, share text, notepad, bloc note, bloc note en ligne, bloc notes, note pad, online notepad, free notepad, bloc-notes en ligne, bloc-notes, blocnote, blocnote en ligne, cuaderno de notas, bloc de notas, bloc de notas en línea, cuaderno de notas en línea, блокнот, блокнот онлайн, онлайн блокнот, 记事本, 在线记事本, 记事本在线',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'Online Text Pad • Write, Edit & Share in the Cloud',
    description: 'Free online text pad and notepad. Write, edit, and share your text in the cloud.',
    type: 'website',
    url: 'https://textpad.cloud',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Text Pad • Write, Edit & Share in the Cloud',
    description: 'Free online text pad and notepad. Write, edit, and share your text in the cloud.',
  },
}

export default function HomeLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'TextPad',
            description: 'Free online text pad and notepad. Write, edit, and share your text in the cloud.',
            url: 'https://textpad.cloud',
            applicationCategory: 'TextEditor',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            publisher: {
              '@type': 'Organization',
              name: 'TextPad',
              url: 'https://textpad.cloud',
            },
            featureList: [
              'Online text editor',
              'Cloud storage',
              'Text formatting',
              'Share documents',
              'Free notepad',
            ],
          }),
        }}
      />
      {children}
    </>
  )
}

