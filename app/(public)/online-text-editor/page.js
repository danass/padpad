import Link from 'next/link'

export async function generateMetadata() {
    return {
        title: 'Professional Online Text Editor – Blocnote Online | TextPad',
        description: 'Experience the best free online text editor. Write, format, and share documents instantly with TextPad, the ultimate professional blocnote online with pictures and version history.',
        alternates: {
            canonical: '/online-text-editor',
        },
        openGraph: {
            type: 'website',
            title: 'Professional Online Text Editor – Blocnote Online | TextPad',
            description: 'Write, format, and share documents instantly with TextPad, the professional blocnote online.',
            images: [{ url: '/padpad.png', width: 512, height: 512, alt: 'TextPad' }],
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Professional Online Text Editor – Write & Share | TextPad',
            description: 'TextPad is a fast, free online text editor. Write text instantly, share with a link, or create disposable pads. No account needed.',
        },
    }
}

export default function OnlineTextEditorPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                    Professional Online Text Editor
                </h1>

                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                    TextPad is a high-performance online textpad designed for speed and simplicity.
                    Whether you need a quick draft or a collaborative workspace, TextPad delivers a seamless writing experience.
                </p>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Write and Edit Instantly</h2>
                    <p className="text-gray-700 leading-relaxed">
                        A clean, distraction-free editor that loads in milliseconds.
                        Equipped with professional tools like auto-save and persistent history, your work is always protected.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Share with Full Control</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Generate a secure, shareable URL for your documents instantly.
                        Control permissions to allow others to view or collaborate on your text in real-time.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Disposable Pads for Maximum Privacy</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Create temporary "disposable" pads that automatically expire after 48 hours.
                        Perfect for quick notes, temporary collaboration, or sensitive information you don't want to keep forever.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Use Cases</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                        <li className="p-4 bg-gray-50 rounded-lg"><strong>Developers:</strong> Fast code snippets and technical documentation.</li>
                        <li className="p-4 bg-gray-50 rounded-lg"><strong>Writers:</strong> Secure drafts and quick brainstorming sessions.</li>
                        <li className="p-4 bg-gray-50 rounded-lg"><strong>Teams:</strong> Real-time meeting notes and shared task lists.</li>
                        <li className="p-4 bg-gray-50 rounded-lg"><strong>Students:</strong> Quick lecture notes and research outlines.</li>
                    </ul>
                </section>

                <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-6">
                    <Link
                        href="/"
                        className="inline-block bg-black text-white px-8 py-3 rounded-md text-center font-medium hover:bg-gray-800 transition-all shadow-sm"
                    >
                        Start Writing Now
                    </Link>
                    <div className="text-sm text-gray-500 flex items-center gap-4">
                        <Link href="/feed" className="hover:text-black transition-colors underline decoration-gray-300 underline-offset-4">Browse Feed</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
