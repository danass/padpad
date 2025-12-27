import Link from 'next/link'

export const metadata = {
    title: 'Page Not Found – Textpad',
    description: 'The page you are looking for does not exist. Start writing with Textpad, a free online text editor with personal blog features.',
}

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
            <div className="text-center max-w-md">
                <div className="mb-8">
                    <img
                        src="/padpad.svg"
                        alt="Textpad"
                        className="w-24 h-24 mx-auto opacity-20"
                    />
                </div>
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-xl font-medium text-gray-700 mb-4">Page not found</h2>
                <p className="text-gray-500 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium transition-colors"
                    >
                        Start Writing
                    </Link>
                </div>
            </div>

            {/* SEO content */}
            <div className="mt-16 max-w-2xl text-center">
                <p className="text-sm text-gray-400">
                    Textpad is a free online text editor. Write, edit and share text instantly.
                    Create your own public blog with a custom subdomain. No account needed to start.
                </p>
            </div>
        </div>
    )
}
