import Link from 'next/link'

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

    return {
        title: 'Version History | Textpad',
        description: 'Every save is preserved. Browse your document history, restore any version, never lose your work.',
        openGraph: {
            type: 'website',
            url: `${baseUrl}/features/version-history`,
            title: 'Version History | Textpad',
            description: 'Every save is preserved. Browse your document history, restore any version.',
        },
        alternates: {
            canonical: `${baseUrl}/features/version-history`,
        },
    }
}

export default function VersionHistoryPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Version History
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Made a mistake? Deleted something important? No worries.
                        Every version of your document is saved automatically.
                    </p>
                </div>

                {/* Main Feature */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Restore Any Version
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Open the history panel and browse all your saves.
                                Click to preview, one more click to restore. Simple as that.
                            </p>
                            <ul className="space-y-2 text-gray-600 text-sm">
                                <li>✓ Automatic snapshots on every save</li>
                                <li>✓ See when each version was created</li>
                                <li>✓ One-click restore</li>
                                <li>✓ Delete old versions to save space</li>
                            </ul>
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                            <img
                                src="/features/screens/pad_restore_history.png"
                                alt="Version history panel"
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
                                Every time you save, a snapshot is created automatically.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                                2
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Browse</h3>
                            <p className="text-gray-600 text-sm">
                                Open history to see all your past versions with timestamps.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                                3
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Restore</h3>
                            <p className="text-gray-600 text-sm">
                                Click any version to restore it. Your document is back.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Keep it clean */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Keep it clean
                    </h2>
                    <p className="text-gray-700 mb-4">
                        Too many versions? Use "Keep only last" to delete all old snapshots
                        except the most recent one. Clean history, fresh start.
                    </p>
                    <p className="text-gray-600 text-sm">
                        Empty snapshots (just whitespace) can also be deleted in bulk.
                    </p>
                </section>

                {/* CTA */}
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Never lose work again
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Start writing and watch your history grow.
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
                        <Link href="/features/tabs-and-drive" className="text-gray-900 underline">Tabs & Drive</Link>
                        {' · '}
                        <Link href="/features/public-blog" className="text-gray-900 underline">Public Blog</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
