import Link from 'next/link'

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

    return {
        title: 'Public Blog & Archive | Textpad',
        description: 'Turn your documents into a public blog. Share your writing at username.textpad.cloud. Simple publishing.',
        openGraph: {
            type: 'website',
            url: `${baseUrl}/features/public-blog`,
            title: 'Public Blog & Archive | Textpad',
            description: 'Turn your documents into a public blog. Share your writing at username.textpad.cloud. Simple publishing.',
        },
        alternates: {
            canonical: `${baseUrl}/features/public-blog`,
        },
    }
}

export default function PublicBlogPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                    Your Public Archive
                </h1>

                <p className="text-lg text-gray-700 mb-8">
                    Publish selected documents to your personal page.
                    Choose a username, get your own archive URL.
                    Navigate between your public texts.
                </p>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">How it works</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Choose a username in settings</li>
                        <li>Mark documents as public when ready</li>
                        <li>Access your archive at /archive/username</li>
                        <li>Readers can browse all your public texts</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">When to use it</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Simple blogging without a full platform</li>
                        <li>Sharing essays, articles, or stories</li>
                        <li>Building a public writing portfolio</li>
                        <li>Publishing updates or announcements</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Control your visibility</h2>
                    <p className="text-gray-700">
                        Everything is private by default.
                        You choose what to publish.
                        Unpublish anytime with one click.
                    </p>
                </section>

                <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        <Link href="/" className="text-gray-900 underline">Start writing</Link>
                        {' · '}
                        <Link href="/features/digital-testament" className="text-gray-900 underline">Learn about digital testament</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
