'use client'

import Link from 'next/link'
import { useLanguage } from '@/app/i18n/LanguageContext'

// Simple header for subdomain pages - no auth, no useSession
export default function SubdomainHeader() {
    const { t } = useLanguage()

    return (
        <header className="border-b border-gray-200 bg-white relative z-[100]">
            <div className="max-w-full mx-auto">
                <div className="flex items-center justify-between px-6 h-16">
                    {/* Left side - Logo */}
                    <div className="flex items-center gap-3">
                        <a href="https://www.textpad.cloud" className="flex items-center gap-2" title="Textpad">
                            <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                                <img
                                    src="/padpad.svg"
                                    alt="textpad logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-900">textpad</span>
                        </a>
                    </div>

                    {/* Right side - Write button */}
                    <div className="flex items-center gap-3">
                        <a
                            href="https://www.textpad.cloud"
                            className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-xs md:text-sm font-medium transition-colors"
                        >
                            {t?.writeOnTextpad || 'Write on Textpad'}
                        </a>
                    </div>
                </div>
            </div>
        </header>
    )
}
