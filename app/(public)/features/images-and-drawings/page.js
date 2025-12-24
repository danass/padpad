import Link from 'next/link'

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

    return {
        title: 'Images & Drawings | Textpad',
        description: 'Add images, resize them, and draw directly in your documents. Sketch ideas, add diagrams, illustrate your writing.',
        openGraph: {
            type: 'website',
            url: `${baseUrl}/features/images-and-drawings`,
            title: 'Images & Drawings | Textpad',
            description: 'Add images, resize them, and draw directly in your documents.',
        },
        alternates: {
            canonical: `${baseUrl}/features/images-and-drawings`,
        },
    }
}

export default function ImagesAndDrawingsPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Images & Drawings
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Your text pad is more than text. Add images, resize them on the fly,
                        and draw directly in your documents.
                    </p>
                </div>

                {/* Feature: Drawing */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Draw Your Ideas
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Open the brush tool and sketch directly in your document.
                                Perfect for quick diagrams, annotations, or just doodling while you think.
                            </p>
                            <ul className="space-y-2 text-gray-600 text-sm">
                                <li>✓ Multiple brush sizes</li>
                                <li>✓ Color picker</li>
                                <li>✓ Eraser tool</li>
                                <li>✓ Drawings save automatically</li>
                            </ul>
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                            <img
                                src="/features/screens/pad_make_a_drawing.png"
                                alt="Drawing tool in action"
                                className="w-full"
                            />
                        </div>
                    </div>
                </section>

                {/* Feature: Drawings in Articles */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="order-2 md:order-1 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                            <img
                                src="/features/screens/blog_my_drawing_in_pad.png"
                                alt="Drawing embedded in text"
                                className="w-full"
                            />
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Drawings Live With Your Text
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Your drawings aren't separate files. They're embedded right in your document,
                                flowing with your text. Share the document and your drawings come along.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Feature: Resize Images */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Resize Images Instantly
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Drag the corners to resize any image. Make it full-width or keep it small.
                                The layout adapts to your content.
                            </p>
                            <p className="text-gray-600 text-sm">
                                Drag and drop images, or paste from clipboard. We handle the rest.
                            </p>
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                            <img
                                src="/features/screens/pad_change_image_width.png"
                                alt="Resizing an image"
                                className="w-full"
                            />
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Try the drawing tool
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Open a new pad and click the brush icon. Start sketching.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                        Start Drawing
                    </Link>
                </div>

                {/* Footer Links */}
                <div className="pt-8 mt-12 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">
                        <Link href="/features" className="text-gray-900 underline">All features</Link>
                        {' · '}
                        <Link href="/features/public-blog" className="text-gray-900 underline">Public Blog</Link>
                        {' · '}
                        <Link href="/features/version-history" className="text-gray-900 underline">Version History</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
