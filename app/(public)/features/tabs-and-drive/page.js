import Link from 'next/link'

export async function generateMetadata() {
    return {
        title: 'Tabs & Drive – Stay Organized | Textpad',
        description: 'Manage multiple documents with browser-like tabs. Organize your writing in a clean, intuitive drive.',
        openGraph: {
            type: 'website',
            title: 'Tabs & Drive – Stay Organized | Textpad',
            description: 'Manage multiple documents with browser-like tabs. Organize your writing in a clean, intuitive drive.',
        },
        alternates: {
            canonical: '/features/tabs-and-drive',
        },
    }
}

export default function TabsAndDrivePage() {
    return (
        <div className="min-h-screen bg-white font-['DM_Sans',sans-serif]">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-medium text-gray-900 mb-6 tracking-tight leading-[1.1]">
                        Smart <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">Drive & Tabs</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-normal max-w-2xl mx-auto">
                        Professional organization for serious writers. Manage multiple documents with ease using our folder-based drive and persistent browser-like tabs.
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-20 mb-24">
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-cyan-400 decoration-4 underline-offset-4">Fluid Multi-Tasking</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Switch between research documents, drafts, and sketches instantly. Our persistent tab system remembers exactly where you left off, even across sessions.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                No more searching through history or reopening files. Your workspace stays exactly how you like it.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-3xl border border-gray-100 flex items-center justify-center overflow-hidden shadow-2xl">
                            <img
                                src="/features/showcase/tabs-and-drive.png"
                                alt="Textpad Drive and Tabbed Navigation"
                                className="w-full h-auto rounded-2xl"
                            />
                        </div>
                    </section>

                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 bg-gray-50 aspect-video rounded-3xl border border-gray-100 flex items-center justify-center italic text-gray-400">
                            Drive Organization Preview...
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-emerald-400 decoration-4 underline-offset-4">Deep Organization</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Group your projects into folders. Right-click to rename, move, or delete. Our drive gives you the power of a desktop file explorer directly in your browser.
                            </p>
                        </div>
                    </section>
                </div>

                {/* CTA */}
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-cyan-50/30 rounded-[3rem] border border-gray-100 px-4">
                    <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-8 tracking-tight">Organize your creative life</h2>
                    <Link
                        href="/drive"
                        className="inline-block px-10 py-4 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-cyan-100"
                    >
                        Open Your Drive
                    </Link>
                </div>

                {/* Footer Nav */}
                <div className="pt-12 mt-20 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-400">
                        <Link href="/features" className="text-gray-900 hover:text-cyan-600 transition-colors">All Features</Link>
                        {' · '}
                        <Link href="/features/version-history" className="text-gray-900 hover:text-cyan-600 transition-colors">Version History</Link>
                        {' · '}
                        <Link href="/" className="text-gray-900 hover:text-cyan-600 transition-colors">Start Writing</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
