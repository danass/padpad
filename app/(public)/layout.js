import SubdomainHeader from '@/components/layout/SubdomainHeader'

// Minimal layout for public pages - NO SessionProvider, NO auth
export default function PublicLayout({ children }) {
    return (
        <>
            <SubdomainHeader />
            <main className="flex-1">
                {children}
            </main>
            <footer className="w-full py-4 mt-auto">
                <div className="flex items-center justify-center">
                    <a href="https://www.textpad.cloud" className="text-xs text-gray-400 hover:text-gray-600">
                        textpad.cloud
                    </a>
                </div>
            </footer>
        </>
    )
}
