import Link from 'next/link'

export async function generateMetadata() {
    return {
        title: 'Version History – Never Lose Work | Textpad',
        description: 'Every change is saved. Travel back in time to any previous version of your document with persistent history.',
        openGraph: {
            type: 'website',
            title: 'Version History – Never Lose Work | Textpad',
            description: 'Every change is saved. Travel back in time to any previous version of your document.',
        },
        alternates: {
            canonical: '/features/version-history',
        },
    }
}

export default function VersionHistoryPage() {
    return (
        <div className="min-h-screen bg-white font-['DM_Sans',sans-serif]">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-medium text-gray-900 mb-6 tracking-tight leading-[1.1]">
                        Infinite <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">History</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-normal max-w-2xl mx-auto">
                        Never lose a single character. Textpad maintains a deep event log of every change, allowing you to travel back to any moment in your document's life.
                    </p>
                </div>

                {/* Feature Content */}
                <div className="space-y-20 mb-24">
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-cyan-400 decoration-4 underline-offset-4">Time Travel</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Our versioning system isn't just about regular saves. We track character-level events, giving you the power to see exactly how your ideas evolved over time.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Preview any past version and restore it with a single click. Your history is permanent and secure.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-3xl border border-gray-100 flex items-center justify-center overflow-hidden shadow-2xl">
                            <img
                                src="/features/showcase/version-history.png"
                                alt="Version History Interface in Textpad"
                                className="w-full h-auto rounded-2xl"
                            />
                        </div>
                    </section>

                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 bg-gray-50 aspect-video rounded-3xl border border-gray-100 flex items-center justify-center italic text-gray-400">
                            Restoration Logic Preview...
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-emerald-400 decoration-4 underline-offset-4">Granular Control</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Choose which versions to keep and which to prune. Maintain a clean workspace while feeling the security of a permanent archive.
                            </p>
                        </div>
                    </section>
                </div>

                {/* CTA */}
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-cyan-50/30 rounded-[3rem] border border-gray-100 px-4">
                    <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-8 tracking-tight">Write with a safety net</h2>
                    <Link
                        href="/"
                        className="inline-block px-10 py-4 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-cyan-100"
                    >
                        Experience Infinite History
                    </Link>
                </div>

                {/* Footer Nav */}
                <div className="pt-12 mt-20 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-400">
                        <Link href="/features" className="text-gray-900 hover:text-cyan-600 transition-colors">All Features</Link>
                        {' · '}
                        <Link href="/features/tabs-and-drive" className="text-gray-900 hover:text-cyan-600 transition-colors">Tabs & Drive</Link>
                        {' · '}
                        <Link href="/" className="text-gray-900 hover:text-cyan-600 transition-colors">Start Writing</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
