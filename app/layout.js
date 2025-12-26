import './globals.css'
import { LanguageProvider } from '@/app/i18n/LanguageContext'
import { cookies, headers } from 'next/headers'
import { auth } from '@/auth'
import SessionProvider from '@/components/providers/SessionProvider'
import UniversalHeader from '@/components/layout/UniversalHeader'
import Footer from '@/components/layout/Footer'
import { PostHogProvider } from '@/components/providers/PostHogProvider'
import { PostHogPageView } from '@/components/providers/PostHogPageView'

// SEO translations
const seoTranslations = {
  en: {
    title: 'Textpad – Blocnote Online & Free Professional Text Editor',
    description: 'Write, edit and share text instantly with Textpad, the professional blocnote online. Create a public blog, save with version history, and use our online text editor with pictures. No account needed.',
  },
  fr: {
    title: 'Textpad – Blocnote en Ligne & Éditeur de Texte Gratuit',
    description: 'Écrivez et partagez votre texte avec Textpad, le blocnote en ligne gratuit. Créez un blog public, sauvegardez avec historique, et profitez d\'un bloc-notes en ligne avec images. Sans inscription.',
  },
}

// Detect locale from cookie or Accept-Language header
async function getLocale() {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('textpad_locale')

  if (localeCookie?.value && ['en', 'fr'].includes(localeCookie.value)) {
    return localeCookie.value
  }

  // Fallback to Accept-Language header
  const headersList = await headers()
  const acceptLang = headersList.get('accept-language') || ''

  if (acceptLang.toLowerCase().startsWith('fr')) {
    return 'fr'
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
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      title: t.title,
      description: t.description,
      type: 'website',
      url: '/',
      siteName: 'Textpad',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? ['en_US'] : ['fr_FR'],
      images: [{ url: '/padpad.webp', width: 512, height: 512, alt: 'Textpad Logo' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.title,
      description: t.description,
    },
    alternates: {
      canonical: '/',
      languages: {
        'en': 'https://www.textpad.cloud/',
        'fr': 'https://www.textpad.cloud/',
        'x-default': 'https://www.textpad.cloud/',
      },
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
  name: 'Textpad',
  url: '/',
  description: 'Free online text editor with personal blog, document sharing, version history and folder organization.',
  applicationCategory: 'Productivity',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Online text editing',
    'Personal blog with custom subdomain',
    'Document sharing via link',
    'Version history',
    'Folder organization',
    'No account required to start',
  ],
}

// Root layout - minimal, shared by all route groups
export default async function RootLayout({ children }) {
  const locale = await getLocale()
  const session = await auth()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head suppressHydrationWarning>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
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
