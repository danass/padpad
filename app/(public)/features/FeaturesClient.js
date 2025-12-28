'use client'

import Link from 'next/link'
import { HardDrive, Sparkles, Layout, PenTool, Palette, History, Shield } from 'lucide-react'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function FeaturesClient() {
    const { t } = useLanguage()

    // Simplified list using original marketing concepts
    const features = [
        { title: 'IPFS Persistence', desc: 'Secure your thoughts on the permanent, decentralized web.', href: '/features/decentralized-storage', icon: <HardDrive className="w-6 h-6" /> },
        { title: 'Digital Legacy', desc: 'Write for the future. Automatic publishing on your 99th birthday.', href: '/features/digital-testament', icon: <Sparkles className="w-6 h-6" /> },
        { title: 'Smart Drive & Tabs', desc: 'Organize your entire writing life with folders and browser-style tabs.', href: '/features/tabs-and-drive', icon: <Layout className="w-6 h-6" /> },
        { title: 'Visual Sketching', desc: 'Integrated drawing canvas to visualize ideas directly in your docs.', href: '/features/images-and-drawings', icon: <PenTool className="w-6 h-6" /> },
        { title: 'Instant Publishing', desc: 'Transform documents into professional blogs on your own subdomain.', href: '/features/public-blog', icon: <Layout className="w-6 h-6" /> },
        { title: 'Rich Media First', desc: 'Native support for drive videos, YouTube, audio, and drawings.', href: '/features/rich-media', icon: <Palette className="w-6 h-6" /> },
        { title: 'Infinite History', desc: 'Full event logs of every character change. Travel back to any moment.', href: '/features/version-history', icon: <History className="w-6 h-6" /> },
        { title: 'Link-Based Privacy', desc: 'Your work is private by default, shared only via unique links.', href: '/features/shareable-links', icon: <Shield className="w-6 h-6" /> },
    ]

    return (
        <div className="min-h-screen bg-white font-['DM_Sans',sans-serif]">
            <div className="max-w-6xl mx-auto px-4 py-20 md:py-32">
                {/* Header Section */}
                <div className="text-center mb-24">
                    <Link href="/" className="inline-block mb-12 hover:scale-105 transition-transform">
                        <img src="/padpad.svg" alt="Textpad" className="w-20 h-20 mx-auto" />
                    </Link>
                    <h1 className="text-4xl md:text-7xl font-medium text-gray-900 mb-8 tracking-tight leading-[1.1]">
                        Capabilities of the <br />
                        <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">Permanent Web</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 font-normal max-w-3xl mx-auto leading-relaxed">
                        Textpad isn't just a notepad. It's a professional-grade creative engine designed for permanence, organization, and visual storytelling.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                    {features.map((feature, i) => (
                        <Link
                            key={i}
                            href={feature.href}
                            className="group p-8 bg-white border border-gray-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-cyan-100/50 hover:border-cyan-200 transition-all duration-300 flex flex-col items-start text-left"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600 mb-8 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                                {feature.icon || <Sparkles className="w-6 h-6" />}
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight group-hover:underline decoration-cyan-400 decoration-2 underline-offset-4 decoration-transparent group-hover:decoration-cyan-400 transition-all">
                                {feature.title}
                            </h2>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                {feature.desc}
                            </p>
                            <div className="mt-8 text-cyan-600 font-medium text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                Learn more <span className="text-lg">→</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Final CTA */}
                <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-cyan-50/30 rounded-[4rem] border border-gray-100 px-4">
                    <h2 className="text-3xl md:text-5xl font-medium text-gray-900 mb-8 tracking-tight">
                        Ready to start your journey?
                    </h2>
                    <Link
                        href="/"
                        className="inline-flex px-12 py-5 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 active:scale-95 transition-all text-xl shadow-xl hover:shadow-cyan-100"
                    >
                        Open the Editor
                    </Link>
                </div>
            </div>
        </div>
    )
}
