import { ToastProvider } from '@/components/ui/toast'
import { NO_INDEX_METADATA } from '@/lib/seo'

// Layout for authenticated pages
export const metadata = {
    ...NO_INDEX_METADATA,
}

export default function MainLayout({ children }) {
    return (
        <ToastProvider>
            <main className="flex-1">
                {children}
            </main>
        </ToastProvider>
    )
}
