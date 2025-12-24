import Link from 'next/link'

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

    return {
        title: 'Write Text Online Without Account | Textpad',
        description: 'Start writing immediately. No signup, no login, no friction. Your text is saved locally until you choose to save it.',
        openGraph: {
            type: 'website',
            url: `${baseUrl}/features/no-account`,
            title: 'Write Text Online Without Account | Textpad',
            description: 'Start writing immediately. No signup, no login, no friction. Your text is saved locally until you choose to save it.',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Write Text Online Without Account | Textpad',
            description: 'Start writing immediately. No signup, no login, no friction. Your text is saved locally until you choose to save it.',
        },
        alternates: {
            canonical: `${baseUrl}/features/no-account`,
        },
    }
}

export default function NoAccountPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                    No Account Required, Just Write
                </h1>

                <p className="text-lg text-gray-700 mb-8">
                    Open Textpad and start typing. No forms. No email verification.
                    Your browser saves your work automatically.
                </p>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">How it works</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Go to textpad.cloud</li>
                        <li>Start writing immediately</li>
                        <li>Your text is saved in your browser</li>
                        <li>Create an account later only if you want cloud sync</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">When to use it</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Quick notes you don't want to lose</li>
                        <li>Drafting something before sending</li>
                        <li>Temporary scratch pad</li>
                        <li>When you need to write now, not later</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Why it's simpler than alternatives</h2>
                    <p className="text-gray-700">
                        Most text editors ask you to sign up before you can write.
                        Textpad lets you write first. That's it.
                    </p>
                </section>

                <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        <Link href="/" className="text-gray-900 underline">Start writing now</Link>
                        {' · '}
                        <Link href="/features/shareable-links" className="text-gray-900 underline">Learn about sharing your text</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
