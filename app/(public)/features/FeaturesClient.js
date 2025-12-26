'use client'

import Link from 'next/link'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function FeaturesClient() {
    const { t } = useLanguage()

    const features = [
        {
            title: t.featureDigitalLegacyTitle,
            description: t.featureDigitalLegacyDesc,
            href: '/features/digital-testament',
        },
        {
            title: t.featurePublicBlogTitle,
            description: t.featurePublicBlogDesc,
            href: '/features/public-blog',
        },
        {
            title: t.featureShareableLinksTitle,
            description: t.featureShareableLinksDesc,
            href: '/features/shareable-links',
        },
        {
            title: t.featureTabsDriveTitle,
            description: t.featureTabsDriveDesc,
            href: '/features/tabs-and-drive',
        },
        {
            title: t.featureVersionHistoryTitle,
            description: t.featureVersionHistoryDesc,
            href: '/features/version-history',
        },
        {
            title: t.featureImagesDrawingsTitle,
            description: t.featureImagesDrawingsDesc,
            href: '/features/images-and-drawings',
        },
    ]

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
                {/* Logo + Title */}
                <div className="flex items-center gap-4 mb-6">
                    <img
                        src="/padpad.svg"
                        alt="Textpad"
                        className="w-16 h-16"
                    />
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                            {t.featuresTitle}
                        </h1>
                        <p className="text-gray-500">{t.featuresSubtitle}</p>
                    </div>
                </div>

                <p className="text-lg text-gray-700 mb-10">
                    {t.featuresIntro}
                </p>

                <div className="grid gap-4">
                    {features.map((feature) => (
                        <Link
                            key={feature.href}
                            href={feature.href}
                            className="block p-5 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-lg font-medium text-gray-900">{feature.title}</h2>
                                {feature.badge && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                        {feature.badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600">{feature.description}</p>
                        </Link>
                    ))}
                </div>

                <div className="pt-10 mt-10 border-t border-gray-200 text-center">
                    <Link
                        href="/"
                        className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg text-center font-medium hover:bg-gray-800 transition-colors"
                    >
                        {t.startWriting}
                    </Link>
                </div>
            </div>
        </div>
    )
}
