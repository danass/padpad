'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/app/i18n/LanguageContext'

// Check if we're on a subdomain
function checkIsSubdomain() {
    if (typeof window === 'undefined') return false
    const hostname = window.location.hostname
    const match = hostname.match(/^([a-z0-9_-]+)\.textpad\.cloud$/i)
    return match && match[1].toLowerCase() !== 'www'
}

// Header for public pages - shows different content based on domain
export default function PublicHeader() {
    const { t } = useLanguage()
    const { data: session, status } = useSession() || {}
    const pathname = usePathname()
    const [isSubdomain, setIsSubdomain] = useState(false)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        setIsSubdomain(checkIsSubdomain())
        setChecked(true)
    }, [])

    // Minimal header during SSR
    if (!checked) {
        return (
            <header className="border-b border-gray-200 bg-white relative z-[100]">
                <div className="max-w-full mx-auto">
                    <div className="flex items-center justify-between px-6 h-16">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <img src="/logo.svg" alt="textpad logo" width={24} height={24} fetchPriority="high" className="w-full h-full object-cover" />
                                <span className="text-sm font-medium text-gray-900">textpad</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        )
    }

    // On subdomains: simple header with "Write on Textpad" button
    if (isSubdomain) {
        return (
            <header className="border-b border-gray-200 bg-white relative z-[100]">
                <div className="max-w-full mx-auto">
                    <div className="flex items-center justify-between px-6 h-16">
                        <div className="flex items-center gap-3">
                            <a href="https://www.textpad.cloud" className="flex items-center gap-2" title="Textpad">
                                <img src="/logo.svg" alt="textpad logo" width={24} height={24} fetchPriority="high" className="w-full h-full object-cover" />
                                <span className="text-sm font-medium text-gray-900">textpad</span>
                            </a>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://www.textpad.cloud"
                                className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-xs md:text-sm font-medium transition-colors"
                            >
                                {t?.writeOnTextpad || 'Write on Textpad'}
                            </a>
                        </div>
                    </div>
                </div>
            </header>
        )
    }

    // On main domain: header with Sign in OR profile button
    return (
        <header className="border-b border-gray-200 bg-white relative z-[100]">
            <div className="max-w-full mx-auto">
                <div className="flex items-center justify-between px-6 h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2" title={t?.appName || 'Textpad'}>
                            <span className="text-sm font-semibold text-gray-900 uppercase tracking-widest">textpad</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/feed" className={`text-xs font-semibold uppercase tracking-wider transition-colors ${pathname === '/feed' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>{t?.navFeed || 'Feed'}</Link>
                            <Link href="/featured" className={`text-xs font-semibold uppercase tracking-wider transition-colors ${pathname === '/featured' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>{t?.navFeatured || 'Featured'}</Link>
                        </nav>
                    </div>

                    {/* Center title for current page */}
                    {(pathname === '/feed' || pathname === '/featured') && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900">
                                {pathname === '/feed' ? (t?.navFeed || 'Feed') : (t?.navFeatured || 'Featured')}
                            </h1>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        {status === 'loading' ? (
                            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                        ) : session ? (
                            <Link
                                href="/drive"
                                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                            >
                                {session.user?.image ? (
                                    <img src={session.user.image} alt="" className="w-5 h-5 rounded-full" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-xs text-gray-500">
                                            {(session.user?.name || session.user?.email || '?').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <span className="hidden md:inline">{t?.myDrive || 'My Drive'}</span>
                            </Link>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-xs md:text-sm font-medium transition-colors"
                                title={t?.signIn || 'Sign in'}
                            >
                                {t?.signIn || 'Sign in'}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
