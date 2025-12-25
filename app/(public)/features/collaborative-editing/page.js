import Link from 'next/link'

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

    return {
        title: 'Real-Time Collaborative Editing | Textpad',
        description: 'Work together on the same document in real-time. See changes as they happen. Coming soon to Textpad.',
        openGraph: {
            type: 'website',
            url: `${baseUrl}/features/collaborative-editing`,
            title: 'Collaborative Editing | Textpad',
            description: 'Work together on the same document in real-time. Coming soon.',
        },
        alternates: {
            canonical: `${baseUrl}/features/collaborative-editing`,
        },
    }
}

export default function CollaborativeEditingPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-4">
                        Coming Soon
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Collaborative Editing
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Work together on the same document in real-time.
                        See changes as they happen. Like Google Docs, but simpler.
                    </p>
                </div>

                {/* Preview */}
                <section className="mb-16">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 md:p-12 text-center">
                        <div className="text-6xl mb-6">👥</div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Coming to Textpad
                        </h2>
                        <p className="text-gray-600 max-w-lg mx-auto">
                            Real-time collaboration is in development.
                            Multiple users will be able to edit the same document simultaneously,
                            with live cursors and instant sync.
                        </p>
                    </div>
                </section>

                {/* Planned Features */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                        What to Expect
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 border border-gray-200 rounded-xl">
                            <h3 className="font-semibold text-gray-900 mb-2">🔄 Real-Time Sync</h3>
                            <p className="text-gray-600 text-sm">
                                Changes appear instantly for all collaborators. No refresh needed.
                            </p>
                        </div>
                        <div className="p-6 border border-gray-200 rounded-xl">
                            <h3 className="font-semibold text-gray-900 mb-2">👆 Live Cursors</h3>
                            <p className="text-gray-600 text-sm">
                                See where others are typing with colored cursors and names.
                            </p>
                        </div>
                        <div className="p-6 border border-gray-200 rounded-xl">
                            <h3 className="font-semibold text-gray-900 mb-2">🔗 Easy Sharing</h3>
                            <p className="text-gray-600 text-sm">
                                Share a link to invite others. No account required for guests.
                            </p>
                        </div>
                        <div className="p-6 border border-gray-200 rounded-xl">
                            <h3 className="font-semibold text-gray-900 mb-2">📝 Full History</h3>
                            <p className="text-gray-600 text-sm">
                                Every change is tracked. See who edited what and when.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Get Notified */}
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Want to be notified?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Start using Textpad now and you'll get the update automatically.
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
                        <Link href="/features/shareable-links" className="text-gray-900 underline">Shareable Links</Link>
                        {' · '}
                        <Link href="/features/version-history" className="text-gray-900 underline">Version History</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
