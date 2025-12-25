import Link from 'next/link'

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

    return {
        title: 'No Account Required | Start Writing Instantly | Textpad',
        description: 'Start writing immediately without creating an account. Your work is saved locally. Sign in only when you want to sync across devices.',
        openGraph: {
            type: 'website',
            url: `${baseUrl}/features/no-account`,
            title: 'No Account Required | Textpad',
            description: 'Start writing immediately without creating an account. Sign in only when you want to sync.',
        },
        alternates: {
            canonical: `${baseUrl}/features/no-account`,
        },
    }
}

export default function NoAccountPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        No Account Required
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Start writing immediately. No sign-up, no email, no password.
                        Just open the page and write.
                    </p>
                </div>

                {/* How it works */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                        How It Works
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6 bg-gray-50 rounded-xl">
                            <div className="text-3xl mb-4">✍️</div>
                            <h3 className="font-semibold text-gray-900 mb-2">1. Just Write</h3>
                            <p className="text-gray-600 text-sm">
                                Open textpad.cloud and start typing. No interruptions.
                            </p>
                        </div>
                        <div className="text-center p-6 bg-gray-50 rounded-xl">
                            <div className="text-3xl mb-4">💾</div>
                            <h3 className="font-semibold text-gray-900 mb-2">2. Auto-Saved</h3>
                            <p className="text-gray-600 text-sm">
                                Your work is automatically saved in your browser.
                            </p>
                        </div>
                        <div className="text-center p-6 bg-gray-50 rounded-xl">
                            <div className="text-3xl mb-4">☁️</div>
                            <h3 className="font-semibold text-gray-900 mb-2">3. Sync Later</h3>
                            <p className="text-gray-600 text-sm">
                                Sign in when you want to sync across devices.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Benefits */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Your Privacy Matters
                            </h2>
                            <p className="text-gray-700 mb-4">
                                We don't ask for your email just to let you write.
                                Anonymous mode means no tracking, no marketing emails, no data collection.
                            </p>
                            <p className="text-gray-600 text-sm">
                                When you save a document, it stays in your browser until you choose to sign in.
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Why Sign In Eventually?</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Access your documents from any device</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Version history and restore</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Publish to your public blog</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Organize in folders</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Ready to Write?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        No setup required. Just click and start.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                        Start Writing Now
                    </Link>
                </div>

                {/* Footer Links */}
                <div className="pt-8 mt-12 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">
                        <Link href="/features" className="text-gray-900 underline">All features</Link>
                        {' · '}
                        <Link href="/features/public-blog" className="text-gray-900 underline">Public Blog</Link>
                        {' · '}
                        <Link href="/features/version-history" className="text-gray-900 underline">Version History</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
