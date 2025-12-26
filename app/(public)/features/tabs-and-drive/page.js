import Link from 'next/link'

export async function generateMetadata() {
    return {
        title: 'Tabs & Drive – Stay Organized | Textpad',
        description: 'Manage multiple documents with browser-like tabs. Organize your writing in a clean, intuitive drive.',
        openGraph: {
            type: 'website',
            title: 'Tabs & Drive – Stay Organized | Textpad',
            description: 'Manage multiple documents with browser-like tabs. Organize your writing in a clean, intuitive drive.',
        },
        alternates: {
            canonical: '/features/tabs-and-drive',
        },
    }
}

export default function TabsAndDrivePage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Tabs & Drive
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        All your documents in one place. Folders to organize, tabs for quick access,
                        and everything at your fingertips.
                    </p>
                </div>

                {/* Main Screenshot */}
                <div className="mb-16 rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                    <img
                        src="/features/screens/list_files.png"
                        alt="Document drive view"
                        className="w-full"
                    />
                </div>

                {/* Feature: Context Menu */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Right-Click for Actions
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Right-click any document for quick actions. Rename, delete, move to folder,
                                change visibility. Everything you need, one click away.
                            </p>
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                            <img
                                src="/features/screens/list_files_contextualmenu.png"
                                alt="Context menu on documents"
                                className="w-full"
                            />
                        </div>
                    </div>
                </section>

                {/* Feature: Visibility */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="order-2 md:order-1 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                            <img
                                src="/features/screens/list_files_change_visibility_status.png"
                                alt="Change visibility status"
                                className="w-full"
                            />
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Public or Private?
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Toggle visibility with one click. See at a glance which documents
                                are public and which are private. You're always in control.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Feature: Tabs */}
                <section className="mb-16 bg-gray-50 rounded-2xl p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Tabs for Quick Access
                    </h2>
                    <p className="text-gray-700 mb-4">
                        Working on multiple documents? Open them in tabs. Switch between them instantly.
                        Tabs persist across sessions so you can pick up where you left off.
                    </p>
                    <ul className="space-y-2 text-gray-600 text-sm">
                        <li>✓ Multiple documents open at once</li>
                        <li>✓ Tabs remember your position</li>
                        <li>✓ Close tabs you don't need</li>
                        <li>✓ Last tab is always preserved</li>
                    </ul>
                </section>

                {/* CTA */}
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Start organizing
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Create your first folder and see how easy it is.
                    </p>
                    <Link
                        href="/drive"
                        className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                        Open Drive
                    </Link>
                </div>

                {/* Footer Links */}
                <div className="pt-8 mt-12 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">
                        <Link href="/features" className="text-gray-900 underline">All features</Link>
                        {' · '}
                        <Link href="/features/version-history" className="text-gray-900 underline">Version History</Link>
                        {' · '}
                        <Link href="/features/shareable-links" className="text-gray-900 underline">Shareable Links</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
