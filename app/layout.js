import './globals.css'
import { ToastProvider } from '../components/ui/toast'
import Header from '../components/layout/Header'
import SessionProvider from '../components/providers/SessionProvider'

export const metadata = {
  title: 'PadPad - Text Editor',
  description: 'A Vercel-native text editor with history and organization',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Arial:wght@400;700&family=Roboto:wght@300;400;500;700&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Calibri:wght@400;700&family=Times+New+Roman:wght@400;700&family=Georgia:wght@400;700&family=Verdana:wght@400;700&family=Courier+New:wght@400;700&family=Comic+Sans+MS:wght@400;700&family=Impact:wght@400&family=Trebuchet+MS:wght@400;700&family=Arial+Black:wght@400&family=Tahoma:wght@400;700&family=Century+Gothic:wght@400;700&family=Lucida+Sans+Unicode:wght@400;700&family=Palatino:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white">
        <SessionProvider>
          <ToastProvider>
            <Header />
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

