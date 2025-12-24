import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/layout/Footer'

// Layout for public pages - NO SessionProvider, NO auth
export default function PublicLayout({ children }) {
    return (
        <>
            <PublicHeader />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </>
    )
}
