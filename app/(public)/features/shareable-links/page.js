import Link from 'next/link'

export async function generateMetadata() {
    return {
        title: 'Shareable Links – Instant Collaboration | Textpad',
        description: 'Share your work with a single click. Collaborative editing made simple, fast, and secure.',
        openGraph: {
            type: 'website',
            title: 'Shareable Links – Instant Collaboration | Textpad',
            description: 'Share your work with a single click. Collaborative editing made simple.',
        },
        alternates: {
            canonical: '/features/shareable-links',
        },
    }
}

export default function ShareableLinksPage() {
    return (
        <div className="min-h-screen bg-white font-['DM_Sans',sans-serif]">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-medium text-gray-900 mb-6 tracking-tight leading-[1.1]">
                        Link-Based <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">Privacy</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-normal max-w-2xl mx-auto">
                        Your work is private by default. Share it only when you want to, via unique, secure, and obfuscated links.
                    </p>
                </div>

                {/* Privacy Strategy Content */}
                <div className="space-y-20 mb-24">
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-cyan-400 decoration-4 underline-offset-4">Security via Obfuscation</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Every Textpad document is generated with a high-entropy, unique identifier. Unless you share that link or publish the document to your archive, it remains invisible to the world.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                No databases to leak personal credentials. No forced sign-ups. Your privacy is protected by the very structure of the URL.
                            </p>
                        </div>
                        <div className="bg-gray-50 aspect-video rounded-3xl border border-gray-100 flex items-center justify-center italic text-gray-400">
                            Secure Link Visualization...
                        </div>
                    </section>

                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 bg-gray-50 aspect-video rounded-3xl border border-gray-100 flex items-center justify-center italic text-gray-400">
                            Sharing Toggle Preview...
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-emerald-400 decoration-4 underline-offset-4">Instant Collaboration</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Need a second pair of eyes? Just send the link. Collaboration on Textpad is friction-free. Your partners don't need accounts to view or contribute where allowed.
                            </p>
                        </div>
                    </section>
                </div>

                {/* CTA */}
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-cyan-50/30 rounded-[3rem] border border-gray-100 px-4">
                    <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-8 tracking-tight">Share on your own terms</h2>
                    <Link
                        href="/"
                        className="inline-block px-10 py-4 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-cyan-100"
                    >
                        Create Your Private Pad
                    </Link>
                </div>

                {/* Footer Nav */}
                <div className="pt-12 mt-20 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-400">
                        <Link href="/features" className="text-gray-900 hover:text-cyan-400 transition-colors">All Features</Link>
                        {' · '}
                        <Link href="/features/images-and-drawings" className="text-gray-900 hover:text-cyan-400 transition-colors">Images & Drawings</Link>
                        {' · '}
                        <Link href="/" className="text-gray-900 hover:text-cyan-400 transition-colors">Start Writing</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
