import Link from 'next/link'

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

    return {
        title: 'Share Text Online with a Link | Textpad',
        description: 'Paste text, get a link, share it. Simple text sharing without signup or file uploads.',
        openGraph: {
            type: 'website',
            url: `${baseUrl}/features/shareable-links`,
            title: 'Share Text Online with a Link | Textpad',
            description: 'Paste text, get a link, share it. Simple text sharing without signup or file uploads.',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Share Text Online with a Link | Textpad',
            description: 'Paste text, get a link, share it. Simple text sharing without signup or file uploads.',
        },
        alternates: {
            canonical: `${baseUrl}/features/shareable-links`,
        },
    }
}

export default function ShareableLinksPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                    Share Text Instantly with a Link
                </h1>

                <p className="text-lg text-gray-700 mb-8">
                    Write or paste your text. Save it. Share the URL.
                    Anyone with the link can view or edit.
                </p>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">How it works</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Write your text on Textpad</li>
                        <li>Click save to generate a unique URL</li>
                        <li>Copy and share the link</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">When to use it</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Sharing code snippets</li>
                        <li>Sending quick notes to someone</li>
                        <li>Collecting text input from others</li>
                        <li>Temporary document sharing</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Why it's simpler than alternatives</h2>
                    <p className="text-gray-700">
                        No file attachments. No cloud storage setup.
                        Just text and a link. Works everywhere.
                    </p>
                </section>

                <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        <Link href="/" className="text-gray-900 underline">Start writing</Link>
                        {' · '}
                        <Link href="/features/public-blog" className="text-gray-900 underline">Learn about public blog</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
