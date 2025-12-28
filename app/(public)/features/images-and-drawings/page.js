import Link from 'next/link'

export async function generateMetadata() {
    return {
        title: 'Images & Drawings – Visual Writing | Textpad',
        description: 'Enhance your documents with images and handwritten drawings. A truly multimedia writing experience.',
        openGraph: {
            type: 'website',
            title: 'Images & Drawings – Visual Writing | Textpad',
            description: 'Enhance your documents with images and handwritten drawings.',
        },
        alternates: {
            canonical: '/features/images-and-drawings',
        },
    }
}

export default function ImagesAndDrawingsPage() {
    return (
        <div className="min-h-screen bg-white font-['DM_Sans',sans-serif]">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-medium text-gray-900 mb-6 tracking-tight leading-[1.1]">
                        Visual <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">Creative Tools</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-normal max-w-2xl mx-auto">
                        Don't let your ideas be limited by text. Textpad integrates a full creative canvas and rich media engine directly into your writing.
                    </p>
                </div>

                {/* Core Features */}
                <div className="space-y-20 mb-24">
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-cyan-400 decoration-4 underline-offset-4">Integrated Drawing</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Hand-drawn diagrams, quick sketches, or artistic flourishes. Our integrated drawing engine allows you to create directly in the document flow.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                No external tools needed. Your drawings are saved as native elements, fully responsive and crisp on any device.
                            </p>
                        </div>
                        <div className="bg-gray-50 aspect-video rounded-3xl border border-gray-100 flex items-center justify-center italic text-gray-400">
                            Drawing Canvas Preview...
                        </div>
                    </section>

                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 bg-gray-50 aspect-video rounded-3xl border border-gray-100 flex items-center justify-center italic text-gray-400">
                            Rich Media Preview...
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-emerald-400 decoration-4 underline-offset-4">Rich Media Integration</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Embed YouTube videos, upload raw video files from your drive, or link to external media sources. Textpad's media handler ensures your documents are multi-dimensional and alive.
                            </p>
                        </div>
                    </section>
                </div>

                {/* CTA */}
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-cyan-50/30 rounded-[3rem] border border-gray-100 px-4">
                    <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-8 tracking-tight">Ready to visualize your story?</h2>
                    <Link
                        href="/"
                        className="inline-block px-10 py-4 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-cyan-100"
                    >
                        Start Your Visual Note
                    </Link>
                </div>

                {/* Footer Nav */}
                <div className="pt-12 mt-20 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-400">
                        <Link href="/features" className="text-gray-900 hover:text-cyan-600 transition-colors">All Features</Link>
                        {' · '}
                        <Link href="/features/rich-media" className="text-gray-900 hover:text-cyan-600 transition-colors">Rich Media</Link>
                        {' · '}
                        <Link href="/" className="text-gray-900 hover:text-cyan-600 transition-colors">Start Writing</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
