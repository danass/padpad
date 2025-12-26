import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/layout/Footer'

// Layout for public pages
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
