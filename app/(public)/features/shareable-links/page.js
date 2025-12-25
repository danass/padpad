import Link from 'next/link'

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

    return {
        title: 'Share Text Online with a Link | Textpad',
        description: 'Mark any document as public and share it instantly. No signup needed, just a link.',
        openGraph: {
            type: 'website',
            url: `${baseUrl}/features/shareable-links`,
            title: 'Share Text Online with a Link | Textpad',
            description: 'Mark any document as public and share it instantly. No signup needed, just a link.',
            images: [{ url: `${baseUrl}/padpad.png`, width: 512, height: 512, alt: 'Textpad' }],
        },
        alternates: {
            canonical: `${baseUrl}/features/shareable-links`,
        },
    }
}

export default function ShareableLinksPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Shareable Links
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Write your document, mark it as public, and share the link.
                        Anyone can view it instantly.
                    </p>
                </div>

                {/* Main Screenshot */}
                <div className="mb-16 rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                    <img
                        src="/features/screens/pad_share_make_pad_public.png"
                        alt="Make a document public and share"
                        className="w-full"
                    />
                </div>

                {/* Twitter Share Preview */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Beautiful Link Previews
                            </h2>
                            <p className="text-gray-700 mb-4">
                                When you share your document on Twitter, Facebook, or any platform,
                                they'll show a rich preview with your document's title and content.
                            </p>
                            <p className="text-gray-600 text-sm">
                                Makes your shared content look professional and inviting.
                            </p>
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                            <img
                                src="/features/screens/pad_share_twitter.png"
                                alt="Twitter share preview"
                                className="w-full"
                            />
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="mb-16 bg-gray-50 rounded-2xl p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                        How it works
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                                1
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Write</h3>
                            <p className="text-gray-600 text-sm">
                                Create your document as usual.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                                2
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Make Public</h3>
                            <p className="text-gray-600 text-sm">
                                Toggle visibility to public with one click.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                                3
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Share</h3>
                            <p className="text-gray-600 text-sm">
                                Copy the link and send it to anyone.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Use cases */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Perfect for
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-5 bg-gray-50 rounded-xl">
                            <h3 className="font-medium text-gray-900 mb-2">📝 Quick notes</h3>
                            <p className="text-gray-600 text-sm">Send information to someone without attachments.</p>
                        </div>
                        <div className="p-5 bg-gray-50 rounded-xl">
                            <h3 className="font-medium text-gray-900 mb-2">💻 Code snippets</h3>
                            <p className="text-gray-600 text-sm">Share code with proper formatting.</p>
                        </div>
                        <div className="p-5 bg-gray-50 rounded-xl">
                            <h3 className="font-medium text-gray-900 mb-2">📋 Instructions</h3>
                            <p className="text-gray-600 text-sm">Write once, share the link whenever needed.</p>
                        </div>
                        <div className="p-5 bg-gray-50 rounded-xl">
                            <h3 className="font-medium text-gray-900 mb-2">🎯 Temporary sharing</h3>
                            <p className="text-gray-600 text-sm">Make public, share, then make private again.</p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Try it now
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Write something and share it in seconds.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                        Start Writing
                    </Link>
                </div>

                {/* Footer Links */}
                <div className="pt-8 mt-12 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">
                        <Link href="/features" className="text-gray-900 underline">All features</Link>
                        {' · '}
                        <Link href="/features/public-blog" className="text-gray-900 underline">Public Blog</Link>
                        {' · '}
                        <Link href="/features/tabs-and-drive" className="text-gray-900 underline">Tabs & Drive</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
