import Link from 'next/link'

export async function generateMetadata() {
    return {
        title: 'Digital Legacy – Your Words Live On | Textpad',
        description: 'Write now, publish on your 99th birthday. Your documents become public automatically, preserving your words for future generations.',
        openGraph: {
            type: 'website',
            title: 'Digital Legacy – Your Words Live On | Textpad',
            description: 'Write now, publish on your 99th birthday. Preserve your words for future generations.',
        },
        alternates: {
            canonical: '/features/digital-testament',
        },
    }
}

export default function DigitalTestamentPage() {
    return (
        <div className="min-h-screen bg-white font-['DM_Sans',sans-serif]">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-medium text-gray-900 mb-6 tracking-tight leading-[1.1]">
                        Digital <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">Legacy</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-normal max-w-2xl mx-auto">
                        Write your stories today. Preserve them for the next century. Your words automatically become your legacy on your 99th birthday.
                    </p>
                </div>

                {/* Main Feature Content */}
                <div className="space-y-20 mb-24">
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-cyan-400 decoration-4 underline-offset-4">Automatic Preservation</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Most digital content is ephemeral. Textpad changes that. By setting your birth date, you create a temporal lock on your private documents.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                On your 99th birthday, our system automatically transitions your selected works to your public archive—creating a permanent digital testament for future generations.
                            </p>
                        </div>
                        <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-50 p-2">
                            <img
                                src="/features/showcase/digital-testament.png"
                                alt="Digital Testament Settings in Textpad"
                                className="w-full h-auto rounded-2xl"
                            />
                        </div>
                    </section>

                    <section className="bg-amber-50/30 rounded-[3rem] p-8 md:p-12 border border-amber-100">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center tracking-tight">The Journey of Your Words</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="text-3xl mb-4">✍️</div>
                                <h3 className="font-medium text-gray-900 mb-2">Write Freely</h3>
                                <p className="text-gray-500 text-sm">Create memoirs, advice, or stories in total privacy today.</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl mb-4">⏳</div>
                                <h3 className="font-medium text-gray-900 mb-2">Temporal Lock</h3>
                                <p className="text-gray-500 text-sm">Your documents stay private and secure for decades.</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl mb-4">🌍</div>
                                <h3 className="font-medium text-gray-900 mb-2">Be Remembered</h3>
                                <p className="text-gray-500 text-sm">Automatically join the public archive on your 99th birthday.</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* CTA */}
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-cyan-50/30 rounded-[3rem] border border-gray-100 px-4">
                    <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-8 tracking-tight">Begin your digital testament</h2>
                    <Link
                        href="/settings"
                        className="inline-flex px-10 py-4 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-cyan-100"
                    >
                        Configure Legacy Settings
                    </Link>
                </div>

                {/* Footer Nav */}
                <div className="pt-12 mt-20 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-400">
                        <Link href="/features" className="text-gray-900 hover:text-cyan-600 transition-colors">All Features</Link>
                        {' · '}
                        <Link href="/features/public-blog" className="text-gray-900 hover:text-cyan-600 transition-colors">Public Blog</Link>
                        {' · '}
                        <Link href="/" className="text-gray-900 hover:text-cyan-600 transition-colors">Start Writing</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
