import './globals.css'
import { LanguageProvider } from '@/app/i18n/LanguageContext'
import { cookies, headers } from 'next/headers'

// SEO translations
const seoTranslations = {
  en: {
    title: 'Textpad – Free Online Text Editor & Personal Blog',
    description: 'Write, edit and share text instantly with Textpad. Create your own public blog with a custom subdomain. Save documents, version history, organize in folders. No account needed to start.',
  },
  fr: {
    title: 'Textpad – Éditeur de texte en ligne gratuit et blog personnel',
    description: 'Écrivez, éditez et partagez du texte instantanément avec Textpad. Créez votre propre blog public avec un sous-domaine personnalisé. Sauvegardez vos documents, historique des versions, organisez en dossiers.',
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
    title: t.title,
    description: t.description,
    keywords: 'online text editor, textpad, online notepad, personal blog, public blog, text sharing, document editor, free notepad, share text online, version history',
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      title: t.title,
      description: t.description,
      type: 'website',
      url: 'https://www.textpad.cloud',
      siteName: 'Textpad',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? ['en_US'] : ['fr_FR'],
      images: [{ url: 'https://www.textpad.cloud/padpad.png', width: 512, height: 512, alt: 'Textpad Logo' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.title,
      description: t.description,
    },
    alternates: {
      canonical: 'https://www.textpad.cloud',
      languages: {
        'en': 'https://www.textpad.cloud/?locale=en',
        'fr': 'https://www.textpad.cloud/?locale=fr',
        'x-default': 'https://www.textpad.cloud',
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
  url: 'https://www.textpad.cloud',
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
        <LanguageProvider initialLocale={locale}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
