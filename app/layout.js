import './globals.css'
import Script from 'next/script'
import { LanguageProvider } from '@/app/i18n/LanguageContext'
import { cookies, headers } from 'next/headers'
import { auth } from '@/auth'
import SessionProvider from '@/components/providers/SessionProvider'
import UniversalHeader from '@/components/layout/UniversalHeader'
import Footer from '@/components/layout/Footer'
import { PostHogProvider } from '@/components/providers/PostHogProvider'
import { PostHogPageView } from '@/components/providers/PostHogPageView'

const GA_MEASUREMENT_ID = 'G-S6HWH3G1B4'

// SEO translations
const seoTranslations = {
  en: {
    title: 'Textpad Cloud – The Uncensorable Blog',
    description: 'A notepad & blog that lives on your own decentralized storage. Write. Your words, forever. For artists and free thinkers. Censorship-resistant writing powered by IPFS.',
  },
  fr: {
    title: 'Textpad Cloud – Le Blog Incensurable',
    description: 'Un bloc-notes & blog qui vit sur votre propre stockage décentralisé. Écrivez. Vos mots, pour toujours. Fait pour les artistes et les esprits libres. Écriture résistante à la censure propulsée par IPFS.',
  },
  sv: {
    title: 'Textpad Cloud – Den Ocensurera Bloggen',
    description: 'Ett anteckningsblock & blogg som lever på din egen decentraliserade lagring. Skriv. Dina ord, för alltid. För konstnärer och fritänkare. Censurresistent skrivande drivet av IPFS.',
  },
}

// Detect locale from cookie or Accept-Language header
async function getLocale() {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('textpad_locale')

  if (localeCookie?.value && ['en', 'fr', 'es', 'zh', 'ru', 'sv'].includes(localeCookie.value)) {
    return localeCookie.value
  }

  // Fallback to Accept-Language header
  const headersList = await headers()
  const acceptLang = headersList.get('accept-language') || ''

  if (acceptLang.toLowerCase().startsWith('fr')) {
    return 'fr'
  }
  if (acceptLang.toLowerCase().startsWith('sv')) {
    return 'sv'
  }

  return 'en'
}

export async function generateMetadata() {
  const locale = await getLocale()
  const t = seoTranslations[locale] || seoTranslations.en

  return {
    metadataBase: new URL('https://www.textpad.cloud'),
    title: t.title,
    description: t.description,
    keywords: 'blocnote online, textpad online, online text editor with pictures, free online notepad, personal blog, public blog, text sharing, document editor, free notepad, share text online, version history, bloc-notes en ligne, blocnote en ligne avec images, notebook++, application note, editeur de texte en ligne, bloc note en ligne, text en ligne, écrire note, bloc-notes télécharger, notepad en ligne, bloc notes gratuit en ligne, online bloc note, bloc note en ligne gratuit, bloc note personnalisable, note gratuit, site de note, bloc note dessin en ligne, prendre des notes en ligne',
    icons: {
      icon: [
        { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon.ico' }
      ],
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      title: t.title,
      description: t.description,
      type: 'website',
      url: '/',
      siteName: 'Textpad',
      locale: locale === 'fr' ? 'fr_FR' : (locale === 'sv' ? 'sv_SE' : 'en_US'),
      alternateLocale: locale === 'fr' ? ['en_US', 'sv_SE'] : (locale === 'sv' ? ['en_US', 'fr_FR'] : ['fr_FR', 'sv_SE']),
      images: [{ url: '/padpad.webp', width: 512, height: 512, alt: 'Textpad Logo' }],
    },
    other: {
      'og:logo': 'https://www.textpad.cloud/padpad.png',
    },
    twitter: {
      card: 'summary_large_image',
      title: t.title,
      description: t.description,
    },
    alternates: {
      canonical: '/',
    },
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Textpad Cloud',
  url: '/',
  description: 'A censorship-resistant notepad & blog powered by IPFS. For artists and free thinkers.',
  applicationCategory: 'Productivity',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Decentralized IPFS storage',
    'Censorship-resistant publishing',
    'Personal blog with custom subdomain',
    'Markdown editor',
    'Version history',
    'Folder organization',
  ],
}

// Root layout - minimal, shared by all route groups
export default async function RootLayout({ children }) {
  const locale = await getLocale()
  const session = await auth()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head suppressHydrationWarning>
        {/* Google Analytics - lazy loaded for performance */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white min-h-screen flex flex-col" suppressHydrationWarning>
        <PostHogProvider>
          <SessionProvider session={session}>
            <LanguageProvider initialLocale={locale}>
              <PostHogPageView />
              <UniversalHeader />
              {children}
              <Footer />
            </LanguageProvider>
          </SessionProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
