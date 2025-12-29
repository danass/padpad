import Link from 'next/link'

export async function generateMetadata() {
    return {
        title: 'Rich Media – Beyond Simple Text | Textpad',
        description: 'Native support for drive videos, YouTube, audio, and high-fidelity drawings. Make your documents multi-dimensional.',
        alternates: {
            canonical: '/features/rich-media',
        },
    }
}

export default function RichMediaPage() {
    return (
        <div className="min-h-screen bg-white font-['DM_Sans',sans-serif]">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-medium text-gray-900 mb-6 tracking-tight leading-[1.1]">
                        Rich Media <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">First</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-normal max-w-2xl mx-auto">
                        Don't just write. Visualize, play, and interact. Textpad treats media as a first-class citizen in your document flow.
                    </p>
                </div>

                {/* Showcase Image */}
                <div className="mb-20 rounded-[3rem] overflow-hidden border border-gray-100 shadow-2xl bg-gray-50 p-2">
                    <img
                        src="/features/showcase/rich-media.png"
                        alt="Rich Media Integration in Textpad"
                        className="w-full h-auto rounded-[2.5rem]"
                    />
                </div>

                {/* Grid of media types */}
                <div className="grid md:grid-cols-2 gap-12 mb-20">
                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-cyan-400 decoration-2 underline-offset-4">Video Everywhere</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Seamlessly integrate YouTube videos or upload your own video files directly from your drive. Textpad handles the embedding so your story stays fluid.
                        </p>
                        <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 italic">
                            Video Preview
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-emerald-400 decoration-2 underline-offset-4">Audio & Podcasts</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Embed audio players for voice notes, podcasts, or music. Perfect for journalists and creators who need sound to accompany their words.
                        </p>
                        <div className="h-24 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 italic">
                            Audio Player Preview
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-blue-400 decoration-2 underline-offset-4">Live Drawings</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Switch to the canvas at any time. Sketch diagrams, sign documents, or illustrate ideas directly in the text flow.
                        </p>
                        <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 italic">
                            Canvas Preview
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-indigo-400 decoration-2 underline-offset-4">Rich Previews</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Paste any link and watch it transform into a beautiful, high-fidelity preview. Professional layouts for every source.
                        </p>
                        <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 italic">
                            Link Preview
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-cyan-50/30 rounded-[3rem] border border-gray-100">
                    <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-6 tracking-tight">Make your notes come alive</h2>
                    <Link
                        href="/"
                        className="inline-block px-10 py-4 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-cyan-100"
                    >
                        Try the Visual Editor
                    </Link>
                </div>

                {/* Footer Nav */}
                <div className="pt-12 mt-20 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-400">
                        <Link href="/features" className="text-gray-900 hover:text-cyan-600 transition-colors">All Features</Link>
                        {' · '}
                        <Link href="/features/images-and-drawings" className="text-gray-900 hover:text-cyan-600 transition-colors">Images & Drawings</Link>
                        {' · '}
                        <Link href="/" className="text-gray-900 hover:text-cyan-600 transition-colors">Start Writing</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
