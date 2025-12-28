'use client'

import Link from 'next/link'
import { Heart, ExternalLink } from 'lucide-react'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function CreditsClient() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-white font-['DM_Sans',sans-serif]">
            <div className="max-w-6xl mx-auto px-4 py-20 md:py-32">
                {/* Header Section */}
                <div className="text-center mb-24">
                    <Link href="/" className="inline-block mb-12 hover:scale-105 transition-transform">
                        <img src="/padpad.svg" alt="Textpad" className="w-20 h-20 mx-auto" />
                    </Link>
                    <h1 className="text-4xl md:text-7xl font-medium text-gray-900 mb-8 tracking-tight leading-[1.1]">
                        {t?.credits || 'Credits'}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 font-normal max-w-3xl mx-auto leading-relaxed">
                        {t?.madeBy || 'Made with care by'} <span className="text-gray-900">Daniel Assayag</span>
                    </p>
                </div>

                {/* Main Content */}
                <div className="max-w-2xl mx-auto space-y-12">
                    {/* Creator Card */}
                    <a
                        href="https://danpm.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block p-8 bg-white border border-gray-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-cyan-100/50 hover:border-cyan-200 transition-all"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                                <Heart className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Daniel Assayag</h2>
                                <p className="text-gray-500 text-sm">Creator & Developer</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-cyan-600 font-medium text-sm opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                            Visit danpm.com <ExternalLink className="w-4 h-4" />
                        </div>
                    </a>

                    {/* Brother App */}
                    <div className="text-center">
                        <p className="text-gray-400 text-sm mb-4">{t?.brotherApp || 'Brother app of'}</p>
                        <a
                            href="https://instapan.pics"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors font-medium"
                        >
                            instapan.pics <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Back Link */}
                <div className="text-center mt-24">
                    <Link
                        href="/"
                        className="inline-flex px-8 py-4 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 active:scale-95 transition-all shadow-xl hover:shadow-cyan-100"
                    >
                        ← {t?.backToEditor || 'Back to Editor'}
                    </Link>
                </div>
            </div>
        </div>
    )
}
