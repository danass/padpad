export const metadata = {
    title: 'Account Suspended | TextPad',
}

export default function SuspendedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="text-6xl mb-6">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Suspended</h1>
                <p className="text-gray-600 mb-6">
                    Your account has been suspended. Check your email for a link to download your data.
                </p>
                <p className="text-sm text-gray-500 mb-8">
                    You have 30 days to download your data before it may be permanently deleted.
                </p>
                <a
                    href="/"
                    className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
                >
                    Back to Home
                </a>
            </div>
        </div>
    )
}
