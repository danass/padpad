import Link from 'next/link'

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

    return {
        title: 'Digital Testament – Publish After Death | Textpad',
        description: 'Write now, publish later. Your texts can be released publicly after your passing. A digital legacy for your words.',
        openGraph: {
            type: 'website',
            url: `${baseUrl}/features/digital-testament`,
            title: 'Digital Testament – Publish After Death | Textpad',
            description: 'Write now, publish later. Your texts can be released publicly after your passing. A digital legacy for your words.',
        },
        alternates: {
            canonical: `${baseUrl}/features/digital-testament`,
        },
    }
}

export default function DigitalTestamentPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                    Digital Testament
                </h1>

                <p className="text-lg text-gray-700 mb-8">
                    Write your thoughts, stories, or messages now.
                    Choose to have them published after you're gone.
                    Your words live on.
                </p>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">How it works</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Write your documents as usual</li>
                        <li>Set an auto-publish date based on your birthdate</li>
                        <li>Your texts become public when the time comes</li>
                        <li>Nothing is shared until you decide it should be</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">When to use it</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Leave messages for loved ones</li>
                        <li>Share your memoirs or life story</li>
                        <li>Create a time capsule of your thoughts</li>
                        <li>Ensure your words are preserved</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Your private garden</h2>
                    <p className="text-gray-700">
                        Textpad is your secret notebook. Your texts are private by default.
                        Only you control what gets shared and when.
                    </p>
                </section>

                <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        <Link href="/" className="text-gray-900 underline">Start writing</Link>
                        {' · '}
                        <Link href="/features/public-blog" className="text-gray-900 underline">Learn about public sharing</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
