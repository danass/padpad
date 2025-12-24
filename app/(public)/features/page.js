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
        },
        alternates: {
            canonical: `${baseUrl}/features`,
        },
    }
}

const features = [
    {
        title: 'Digital Testament',
        description: 'Write now, publish after you\'re gone. Your words live on.',
        href: '/features/digital-testament',
    },
    {
        title: 'Public Blog & Archive',
        description: 'Share selected documents publicly. Build your personal archive.',
        href: '/features/public-blog',
    },
    {
        title: 'Shareable Links',
        description: 'Share any document with a simple link.',
        href: '/features/shareable-links',
    },
    {
        title: 'Tabs & Drive',
        description: 'Work on multiple documents. Organize in folders.',
        href: '/features/tabs-and-drive',
    },
    {
        title: 'Version History',
        description: 'Every change is saved. Restore any previous version.',
        href: '/features/version-history',
    },
    {
        title: 'Images & Drawings',
        description: 'Add images, draw diagrams, use brush mode.',
        href: '/features/images-and-drawings',
    },
]

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
                    Features
                </h1>

                <p className="text-lg text-gray-700 mb-10">
                    Textpad is your private notebook with public options.
                    Write for yourself. Share when you're ready.
                </p>

                <div className="space-y-6">
                    {features.map((feature) => (
                        <Link
                            key={feature.href}
                            href={feature.href}
                            className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            <h2 className="text-lg font-medium text-gray-900 mb-1">{feature.title}</h2>
                            <p className="text-gray-600">{feature.description}</p>
                        </Link>
                    ))}
                </div>

                <div className="pt-10 mt-10 border-t border-gray-200">
                    <Link
                        href="/"
                        className="inline-block bg-gray-900 text-white px-6 py-3 rounded text-center font-medium hover:bg-gray-800 transition-colors"
                    >
                        Start Writing
                    </Link>
                </div>
            </div>
        </div>
    )
}
