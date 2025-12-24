import Link from 'next/link'

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

    return {
        title: 'Images & Drawings – Rich Text Editing | Textpad',
        description: 'Add images to your documents. Draw directly in the editor. Create visual notes.',
        openGraph: {
            type: 'website',
            url: `${baseUrl}/features/images-and-drawings`,
            title: 'Images & Drawings – Rich Text Editing | Textpad',
            description: 'Add images to your documents. Draw directly in the editor. Create visual notes.',
        },
        alternates: {
            canonical: `${baseUrl}/features/images-and-drawings`,
        },
    }
}

export default function ImagesAndDrawingsPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                    Images and Drawings
                </h1>

                <p className="text-lg text-gray-700 mb-8">
                    Paste or upload images directly.
                    Create drawings inside your document.
                    Resize them as you like.
                </p>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Images</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Paste from clipboard</li>
                        <li>Drag and drop files</li>
                        <li>Use the toolbar button</li>
                        <li>Resize by dragging corners</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Drawings</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>Insert a drawing canvas</li>
                        <li>Sketch with your mouse or finger</li>
                        <li>Edit drawings anytime</li>
                        <li>Perfect for quick diagrams</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Paint brush mode</h2>
                    <p className="text-gray-700">
                        Select text and apply your current style.
                        Change fonts, sizes, colors.
                        Style stays fixed while you paint.
                    </p>
                </section>

                <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        <Link href="/" className="text-gray-900 underline">Start writing</Link>
                        {' · '}
                        <Link href="/features/tabs-and-drive" className="text-gray-900 underline">Learn about tabs and drive</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
