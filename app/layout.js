import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SessionProvider from '@/components/providers/SessionProvider'
import { LanguageProvider } from '@/app/i18n/LanguageContext'

export const metadata = {
  title: 'Online Text Pad • Write, Edit & Share in the Cloud',
  description: 'textpad — online text pad for writing, editing, formatting, and sharing your text instantly.',
  keywords: 'text pad, online editor, text editor, cloud editor, document editor, text formatting, share text',
  openGraph: {
    title: 'Online Text Pad • Write, Edit & Share in the Cloud',
    description: 'textpad — online text pad for writing, editing, formatting, and sharing your text instantly.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Text Pad • Write, Edit & Share in the Cloud',
    description: 'textpad — online text pad for writing, editing, formatting, and sharing your text instantly.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white min-h-screen flex flex-col" suppressHydrationWarning>
        <SessionProvider>
          <LanguageProvider>
            <ToastProvider>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </ToastProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

