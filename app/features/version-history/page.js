import Link from 'next/link'

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

    return {
        title: 'Version History – Track Every Change | Textpad',
        description: 'See all your changes over time. Restore previous versions. Never lose your work.',
        openGraph: {
            type: 'website',
            url: `${baseUrl}/features/version-history`,
            title: 'Version History – Track Every Change | Textpad',
            description: 'See all your changes over time. Restore previous versions. Never lose your work.',
        },
        alternates: {
            canonical: `${baseUrl}/features/version-history`,
        },
    }
}

export default function VersionHistoryPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                    Version History
                </h1>

                <p className="text-lg text-gray-700 mb-8">
                    Every change is saved.
                    Browse your document's history.
                    Restore any previous version.
                </p>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">How it works</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Changes are saved automatically</li>
                        <li>Open history panel with ⌘H</li>
                        <li>See snapshots of your document</li>
                        <li>Click to restore any version</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">When to use it</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Accidentally deleted something</li>
                        <li>Want to compare versions</li>
                        <li>Need to undo many changes at once</li>
                        <li>Reviewing your writing process</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Always safe</h2>
                    <p className="text-gray-700">
                        Your work is autosaved.
                        History is preserved.
                        Write without worry.
                    </p>
                </section>

                <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        <Link href="/" className="text-gray-900 underline">Start writing</Link>
                        {' · '}
                        <Link href="/features/images-and-drawings" className="text-gray-900 underline">Learn about images and drawings</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
