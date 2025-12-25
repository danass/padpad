import Link from 'next/link'

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

    return {
        title: 'Features – What Textpad Can Do | Textpad',
        description: 'Private writing with public options. Version history, tabs, drawings, digital testament, and more.',
        openGraph: {
            type: 'website',
            url: `${baseUrl}/features`,
            title: 'Features – What Textpad Can Do | Textpad',
            description: 'Private writing with public options. Version history, tabs, drawings, digital testament, and more.',
            images: [{ url: `${baseUrl}/padpad.png`, width: 512, height: 512, alt: 'Textpad' }],
        },
        alternates: {
            canonical: `${baseUrl}/features`,
        },
    }
}

const features = [
    {
        title: 'No Account Required',
        description: 'Start writing immediately. Sign in only when you want.',
        href: '/features/no-account',
    },
    {
        title: 'Digital Legacy',
        description: 'Write now, publish on your 99th birthday. Your words live on.',
        href: '/features/digital-testament',
    },
    {
        title: 'Public Blog & Archive',
        description: 'Get your own subdomain. Share your writing publicly.',
        href: '/features/public-blog',
    },
    {
        title: 'Shareable Links',
        description: 'Share any document with a simple link.',
        href: '/features/shareable-links',
    },
    {
        title: 'Tabs & Drive',
        description: 'Organize documents in folders. Work on multiple files.',
        href: '/features/tabs-and-drive',
    },
    {
        title: 'Version History',
        description: 'Every save is preserved. Restore any version.',
        href: '/features/version-history',
    },
    {
        title: 'Images & Drawings',
        description: 'Add images, resize them, draw directly in your docs.',
        href: '/features/images-and-drawings',
    },
    {
        title: 'Collaborative Editing',
        description: 'Work together in real-time. Coming soon.',
        href: '/features/collaborative-editing',
        badge: 'Coming Soon',
    },
]

export default function FeaturesPage() {
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
                            Features
                        </h1>
                        <p className="text-gray-500">What Textpad can do</p>
                    </div>
                </div>

                <p className="text-lg text-gray-700 mb-10">
                    Your private notebook with public options.
                    Write for yourself. Share when you're ready.
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
                        Start Writing
                    </Link>
                </div>
            </div>
        </div>
    )
}
