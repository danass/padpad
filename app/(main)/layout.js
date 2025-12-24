import { ToastProvider } from '@/components/ui/toast'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SessionProvider from '@/components/providers/SessionProvider'

// Layout for authenticated pages
export default function MainLayout({ children }) {
    return (
        <SessionProvider>
            <ToastProvider>
                <Header />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </ToastProvider>
        </SessionProvider>
    )
}
