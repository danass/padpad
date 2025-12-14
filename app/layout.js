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

