import Link from 'next/link'
import Image from 'next/image'

export async function generateMetadata() {
    return {
        title: 'Public Blog – Your Own Corner of the Web | Textpad',
        description: 'Turn your documents into a beautiful public blog. Custom handles, RSS feeds, and seamless sharing.',
        openGraph: {
            type: 'website',
            title: 'Public Blog – Your Own Corner of the Web | Textpad',
            description: 'Turn your documents into a beautiful public blog. Custom handles and seamless sharing.',
        },
        alternates: {
            canonical: '/features/public-blog',
        },
    }
}

export default function PublicBlogPage() {
    return (
        <div className="min-h-screen bg-white font-['DM_Sans',sans-serif]">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-medium text-gray-900 mb-6 tracking-tight leading-[1.1]">
                        Instant <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">Publishing</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-normal max-w-2xl mx-auto">
                        Turn your notes into a professional presence. One click to transform any document into a beautiful blog post on your own subdomain.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="space-y-20 mb-24">
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-cyan-400 decoration-4 underline-offset-4">Your Custom Subdomain</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Claim your name on the creative web. Every Textpad user gets a persistent subdomain at <span className="font-semibold text-gray-900">username.textpad.cloud</span>.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                No hosting to manage, no configurations. Just pick a handle and start building your archive.
                            </p>
                        </div>
                        <div className="bg-gray-50 aspect-video rounded-3xl border border-gray-100 flex items-center justify-center italic text-gray-400">
                            Subdomain Link Preview...
                        </div>
                    </section>

                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 bg-gray-50 p-2 rounded-3xl border border-gray-100 flex items-center justify-center overflow-hidden shadow-2xl">
                            <img
                                src="/features/showcase/public-blog.png"
                                alt="Public Blog Presence Example"
                                className="w-full h-auto rounded-2xl"
                            />
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-emerald-400 decoration-4 underline-offset-4">Minimalist Reading</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Our blog layout is designed for maximum clarity. DM Sans typography, generous white space, and zero distractions. Your readers focus on your words and your visuals, nothing else.
                            </p>
                        </div>
                    </section>
                </div>

                {/* CTA */}
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-cyan-50/30 rounded-[3rem] border border-gray-100 px-4">
                    <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-8 tracking-tight">Launch your corner of the web</h2>
                    <Link
                        href="/"
                        className="inline-block px-10 py-4 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-cyan-100"
                    >
                        Start Your First Post
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
