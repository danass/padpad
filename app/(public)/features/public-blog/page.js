import Link from 'next/link'
import Image from 'next/image'

export async function generateMetadata() {
    return {
        title: 'Public Blog – Your Own Corner of the Web | Textpad',
        description: 'Turn your documents into a beautiful public blog. Custom handles, RSS feeds, and seamless sharing.',
        openGraph: {
            type: 'website',
            title: 'Public Blog – Your Own Corner of the Web | Textpad',
            description: 'Turn your documents into a beautiful public blog. Custom handles and seamless sharing.',
        },
        alternates: {
            canonical: '/features/public-blog',
        },
    }
}

export default function PublicBlogPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Your Own Public Blog
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Pick a username, mark documents as public, and you've got your own blog at
                        <span className="font-semibold text-blue-600"> username.textpad.cloud</span>
                    </p>
                </div>

                {/* Main Screenshot */}
                <div className="mb-16 rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                    <img
                        src="/features/screens/blog_username_list_article_summary_homepage.png"
                        alt="Public blog homepage with article list"
                        className="w-full"
                    />
                </div>

                {/* Feature: Personal URL */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Your Personal URL
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Choose a username in settings and instantly get your own subdomain.
                                No complex setup, no hosting to manage. Just write and publish.
                            </p>
                            <p className="text-gray-600 text-sm">
                                Example: <code className="bg-gray-100 px-2 py-1 rounded">hello.textpad.cloud</code>
                            </p>
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                            <img
                                src="/features/screens/blog_personal_url.png"
                                alt="Personal URL settings"
                                className="w-full"
                            />
                        </div>
                    </div>
                </section>

                {/* Feature: Write and Publish */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="order-2 md:order-1 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                            <img
                                src="/features/screens/blog_my_first_pad_text_writing.png"
                                alt="Writing your first article"
                                className="w-full"
                            />
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Write Like You Always Do
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Use the same editor you know. Add text, images, drawings.
                                When you're ready, mark it as public. That's it.
                            </p>
                            <p className="text-gray-600 text-sm">
                                No templates to learn, no markdown required. Just write.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Feature: Drawings */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Include Your Drawings
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Sketch ideas, add diagrams, illustrate your points.
                                Everything you draw in your pad appears in your public articles.
                            </p>
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                            <img
                                src="/features/screens/blog_my_drawing_in_pad.png"
                                alt="Drawing in a blog article"
                                className="w-full"
                            />
                        </div>
                    </div>
                </section>

                {/* Feature: Navigate Articles */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="order-2 md:order-1 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                            <img
                                src="/features/screens/blog_navigate_articles.png"
                                alt="Navigate between articles"
                                className="w-full"
                            />
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Easy Navigation
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Readers can browse all your public articles.
                                Navigate between posts, discover your archive.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Ready to start your blog?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        It takes 30 seconds. Pick a username and start writing.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                        Start Writing
                    </Link>
                </div>

                {/* Footer Links */}
                <div className="pt-8 mt-12 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">
                        <Link href="/features" className="text-gray-900 underline">All features</Link>
                        {' · '}
                        <Link href="/features/images-and-drawings" className="text-gray-900 underline">Images & Drawings</Link>
                        {' · '}
                        <Link href="/features/digital-testament" className="text-gray-900 underline">Digital Legacy</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
