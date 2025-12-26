import Link from 'next/link'

export async function generateMetadata() {
    return {
        title: 'Digital Legacy – Your Words Live On | Textpad',
        description: 'Write now, publish on your 99th birthday. Your documents become public automatically, preserving your words for future generations.',
        openGraph: {
            type: 'website',
            title: 'Digital Legacy – Your Words Live On | Textpad',
            description: 'Write now, publish on your 99th birthday. Preserve your words for future generations.',
        },
        alternates: {
            canonical: '/features/digital-testament',
        },
    }
}

export default function DigitalTestamentPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Digital Legacy
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Write your thoughts, stories, and messages today.
                        They'll be published on your <span className="font-semibold">99th birthday</span>,
                        preserving your words for future generations.
                    </p>
                </div>

                {/* Main Screenshot */}
                <div className="mb-16 rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                    <img
                        src="/features/screens/digital_testament_public_view.png"
                        alt="Digital legacy public page preview"
                        className="w-full"
                    />
                </div>

                {/* How it works */}
                <section className="mb-16 bg-amber-50 rounded-2xl p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                        How it works
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                                1
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Set your birth date</h3>
                            <p className="text-gray-700 text-sm">
                                Go to Settings and enter your date of birth.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                                2
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Write freely</h3>
                            <p className="text-gray-700 text-sm">
                                Create documents, share memories, leave messages.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                                3
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Auto-publish</h3>
                            <p className="text-gray-700 text-sm">
                                On your 99th birthday, all documents become public.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Settings Screenshot */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Easy Setup
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Just enter your birth date in Settings. That's it.
                                Your legacy date is calculated automatically.
                            </p>
                            <p className="text-gray-600 text-sm">
                                You can remove it anytime — your documents go back to private.
                            </p>
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                            <img
                                src="/features/screens/settings_digital_legacy_setup.png"
                                alt="Digital legacy settings"
                                className="w-full"
                            />
                        </div>
                    </div>
                </section>

                {/* Use cases */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        What you can leave behind
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-gray-50 rounded-xl">
                            <h3 className="font-medium text-gray-900 mb-2">💌 Messages to loved ones</h3>
                            <p className="text-gray-600 text-sm">
                                Letters to your children, grandchildren, or friends that they'll discover one day.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-xl">
                            <h3 className="font-medium text-gray-900 mb-2">📖 Your life story</h3>
                            <p className="text-gray-600 text-sm">
                                Memoirs, experiences, wisdom gathered over a lifetime.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-xl">
                            <h3 className="font-medium text-gray-900 mb-2">🎨 Creative works</h3>
                            <p className="text-gray-600 text-sm">
                                Poems, stories, drawings that you want to share with the world.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-xl">
                            <h3 className="font-medium text-gray-900 mb-2">⏰ Time capsule</h3>
                            <p className="text-gray-600 text-sm">
                                Thoughts about the world today for people in the future.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Privacy note */}
                <section className="mb-16 p-6 border border-gray-200 rounded-xl">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        🔒 Private until you say otherwise
                    </h2>
                    <p className="text-gray-700">
                        Everything is private by default. Your documents stay invisible until the date you've set.
                        You can preview how your legacy page will look, and you can remove the feature anytime.
                    </p>
                </section>

                {/* CTA */}
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Start your digital legacy
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Set your birth date in settings and begin writing.
                    </p>
                    <Link
                        href="/settings"
                        className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                        Go to Settings
                    </Link>
                </div>

                {/* Footer Links */}
                <div className="pt-8 mt-12 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">
                        <Link href="/features" className="text-gray-900 underline">All features</Link>
                        {' · '}
                        <Link href="/features/public-blog" className="text-gray-900 underline">Public Blog</Link>
                        {' · '}
                        <Link href="/" className="text-gray-900 underline">Start Writing</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
