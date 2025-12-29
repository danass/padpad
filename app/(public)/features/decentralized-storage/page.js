import Link from 'next/link'

export async function generateMetadata() {
    return {
        title: 'IPFS Persistence – The Permanent Web | Textpad',
        description: 'Save your documents to the decentralized web. Censorship-resistant, permanent, and always under your control.',
        alternates: {
            canonical: '/features/decentralized-storage',
        },
    }
}

export default function DecentralizedStoragePage() {
    return (
        <div className="min-h-screen bg-white font-['DM_Sans',sans-serif]">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-medium text-gray-900 mb-6 tracking-tight leading-[1.1]">
                        IPFS <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">Persistence</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-normal max-w-2xl mx-auto">
                        Your words shouldn't depend on a single server. Textpad bridges you to the decentralized web for true permanence.
                    </p>
                </div>

                {/* Key Concepts */}
                <div className="space-y-12 mb-20">
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-cyan-400 decoration-4 underline-offset-4">What is IPFS?</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                The InterPlanetary File System (IPFS) is a decentralized protocol where files are stored by their content, not their location. In simple terms: once a document is on IPFS, it exists across a global network rather than a single database.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Textpad makes this complex technology as easy as clicking a "Save to IPFS" button.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-3xl border border-gray-100 flex items-center justify-center overflow-hidden">
                            <img
                                src="/features/showcase/decentralized-storage.png"
                                alt="Textpad IPFS Storage Interface"
                                className="w-full h-auto rounded-2xl shadow-sm"
                            />
                        </div>
                    </section>

                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 bg-gray-50 p-8 rounded-3xl border border-gray-100 flex items-center justify-center italic text-gray-400">
                            Censorship Resistance Visual...
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-emerald-400 decoration-4 underline-offset-4">Censorship Resistance</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Documents on the decentralized web cannot be easily taken down or altered by central authorities. Your thoughts remain your own, preserved exactly as you wrote them, accessible via a permanent content hash.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Benefits List */}
                <div className="grid sm:grid-cols-3 gap-8 mb-20 text-center">
                    <div className="p-6">
                        <div className="text-3xl mb-4">🌍</div>
                        <h3 className="font-semibold text-gray-900 mb-2">Global Access</h3>
                        <p className="text-sm text-gray-500">Accessible through any IPFS gateway, anywhere in the world.</p>
                    </div>
                    <div className="p-6">
                        <div className="text-3xl mb-4">🔒</div>
                        <h3 className="font-semibold text-gray-900 mb-2">Ownership</h3>
                        <p className="text-sm text-gray-500">You hold the hash. You hold the key to your digital history.</p>
                    </div>
                    <div className="p-6">
                        <div className="text-3xl mb-4">⏳</div>
                        <h3 className="font-semibold text-gray-900 mb-2">Permanence</h3>
                        <p className="text-sm text-gray-500">Documents that live as long as the network exists.</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-emerald-50/20 rounded-[3rem] border border-gray-100">
                    <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-6 tracking-tight">Write for the permanent web</h2>
                    <Link
                        href="/"
                        className="inline-block px-10 py-4 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-emerald-100"
                    >
                        Save your first doc to IPFS
                    </Link>
                </div>

                {/* Footer Nav */}
                <div className="pt-12 mt-20 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-400">
                        <Link href="/features" className="text-gray-900 hover:text-cyan-600 transition-colors">All Features</Link>
                        {' · '}
                        <Link href="/features/digital-testament" className="text-gray-900 hover:text-cyan-600 transition-colors">Digital Legacy</Link>
                        {' · '}
                        <Link href="/" className="text-gray-900 hover:text-cyan-600 transition-colors">Start Writing</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
