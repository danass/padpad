import Link from 'next/link'

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

    return {
        title: 'Collaborative Text Editing Online | Textpad',
        description: 'Edit text together in real-time. No downloads, no accounts. Open a link and start collaborating.',
        openGraph: {
            type: 'website',
            url: `${baseUrl}/features/collaborative-editing`,
            title: 'Collaborative Text Editing Online | Textpad',
            description: 'Edit text together in real-time. No downloads, no accounts. Open a link and start collaborating.',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Collaborative Text Editing Online | Textpad',
            description: 'Edit text together in real-time. No downloads, no accounts. Open a link and start collaborating.',
        },
        alternates: {
            canonical: `${baseUrl}/features/collaborative-editing`,
        },
    }
}

export default function CollaborativeEditingPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                    Collaborative Text Editing in Your Browser
                </h1>

                <p className="text-lg text-gray-700 mb-8">
                    Write with others in the same document. Changes appear instantly.
                    Share a link and everyone can edit.
                </p>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">How it works</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Create a document on Textpad</li>
                        <li>Share the document link</li>
                        <li>Everyone with the link can edit in real-time</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">When to use it</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Taking meeting notes together</li>
                        <li>Writing drafts with a colleague</li>
                        <li>Quick brainstorming sessions</li>
                        <li>Pair programming notes</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Why it's simpler than alternatives</h2>
                    <p className="text-gray-700">
                        No accounts required to join. No app to install.
                        Just a URL that works in any browser.
                    </p>
                </section>

                <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        <Link href="/" className="text-gray-900 underline">Start writing</Link>
                        {' · '}
                        <Link href="/features/shareable-links" className="text-gray-900 underline">Learn about shareable links</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
