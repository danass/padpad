import Link from 'next/link'

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

    return {
        title: 'Tabs & Drive – Organize Your Writing | Textpad',
        description: 'Work with multiple tabs. Organize documents in folders. A clean drive interface for all your texts.',
        openGraph: {
            type: 'website',
            url: `${baseUrl}/features/tabs-and-drive`,
            title: 'Tabs & Drive – Organize Your Writing | Textpad',
            description: 'Work with multiple tabs. Organize documents in folders. A clean drive interface for all your texts.',
        },
        alternates: {
            canonical: `${baseUrl}/features/tabs-and-drive`,
        },
    }
}

export default function TabsAndDrivePage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                    Tabs and Drive
                </h1>

                <p className="text-lg text-gray-700 mb-8">
                    Switch between documents with tabs.
                    Organize files in folders.
                    Find your texts quickly.
                </p>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Tabs</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Open multiple documents at once</li>
                        <li>Switch between them instantly</li>
                        <li>Close tabs or keep them open</li>
                        <li>Never lose your place</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Drive</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Create folders for organization</li>
                        <li>Move documents between folders</li>
                        <li>Search across all your texts</li>
                        <li>See all your work in one place</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Simple structure</h2>
                    <p className="text-gray-700">
                        No complex hierarchies.
                        Just folders and files, like you'd expect.
                        Works the way you think.
                    </p>
                </section>

                <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        <Link href="/drive" className="text-gray-900 underline">Open your drive</Link>
                        {' · '}
                        <Link href="/features/version-history" className="text-gray-900 underline">Learn about version history</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
