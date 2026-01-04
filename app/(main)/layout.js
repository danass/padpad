import { ToastProvider } from '@/components/ui/toast'

// Layout for authenticated pages
export default function MainLayout({ children }) {
    return (
        <ToastProvider>
            <main className="flex-1">
                {children}
            </main>
        </ToastProvider>
    )
}
