import Link from 'next/link'

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

    return {
        title: 'Online Text Editor – Write & Share Instantly | Textpad',
        description: 'Write text online. Share with a link. No account needed. Fast, simple, collaborative.',
        openGraph: {
            type: 'website',
            url: `${baseUrl}/online-text-editor`,
            title: 'Online Text Editor – Write & Share Instantly | Textpad',
            description: 'Write text online. Share with a link. No account needed. Fast, simple, collaborative.',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Online Text Editor – Write & Share Instantly | Textpad',
            description: 'Write text online. Share with a link. No account needed. Fast, simple, collaborative.',
        },
        alternates: {
            canonical: `${baseUrl}/online-text-editor`,
        },
    }
}

export default function OnlineTextEditorPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                    Online Text Editor for Quick Writing
                </h1>

                <p className="text-lg text-gray-700 mb-8">
                    Textpad is an online textpad for writing, editing and sharing text.
                    Open it, write, share a link. Done.
                </p>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Write and Edit Text Online</h2>
                    <p className="text-gray-700">
                        A clean editor that loads instantly. No distractions, no toolbars you won't use.
                        Just a place to write.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Share Your Text with a Link</h2>
                    <p className="text-gray-700">
                        Save your document and get a shareable URL.
                        Send it to anyone. They can view or edit depending on permissions.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">No Account, No Friction</h2>
                    <p className="text-gray-700">
                        Start writing without signing up.
                        Your text is saved locally. Create an account only when you need cloud sync.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Use Cases</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li><strong>Developers:</strong> share code snippets, debug notes</li>
                        <li><strong>Writers:</strong> drafts, outlines, quick ideas</li>
                        <li><strong>Teams:</strong> meeting notes, shared documents</li>
                    </ul>
                </section>

                <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/"
                        className="inline-block bg-gray-900 text-white px-6 py-3 rounded text-center font-medium hover:bg-gray-800 transition-colors"
                    >
                        Start Writing
                    </Link>
                    <div className="text-sm text-gray-600 flex items-center gap-3">
                        <Link href="/features/collaborative-editing" className="underline">Collaboration</Link>
                        <Link href="/features/shareable-links" className="underline">Sharing</Link>
                        <Link href="/features/no-account" className="underline">No signup</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
