import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/layout/Footer'
import SessionProvider from '@/components/providers/SessionProvider'

// Layout for public pages
export default function PublicLayout({ children }) {
    return (
        <SessionProvider>
            <PublicHeader />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </SessionProvider>
    )
}
