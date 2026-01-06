'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import Tabs from '@/components/layout/Tabs'
import SignInModal from '@/components/auth/SignInModal'
import { useLanguage } from '@/app/i18n/LanguageContext'
import { getAdminStatus } from '@/lib/auth/adminCache'

// Cache for avatar to reduce DB calls
const headerCache = {
    avatar: null,
    avatarLoadedAt: 0,
    userEmail: null,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes cache
}

// Check if we're on a subdomain
function isSubdomain() {
    if (typeof window === 'undefined') return false
    const hostname = window.location.hostname
    const match = hostname.match(/^([a-z0-9_-]+)\.textpad\.cloud$/i)
    return match && match[1].toLowerCase() !== 'www'
}

export default function UniversalHeader() {
    const { t } = useLanguage()
    const pathname = usePathname()
    const router = useRouter()

    const { data: sessionData, status } = useSession() || {}
    const [onSubdomain, setOnSubdomain] = useState(false)
    const [hydrated, setHydrated] = useState(false)

    const session = onSubdomain ? null : sessionData

    const [isAdmin, setIsAdmin] = useState(false)
    const [customAvatar, setCustomAvatar] = useState(null)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showSignInModal, setShowSignInModal] = useState(false)
    const menuRef = useRef(null)
    const hasLoadedRef = useRef(false)

    const isDrive = pathname?.startsWith('/drive')
    const isDoc = pathname?.startsWith('/doc')
    const isAdminPage = pathname?.startsWith('/admin')
    const isPublicDynamic = pathname?.startsWith('/public/')

    useEffect(() => {
        setOnSubdomain(isSubdomain())
        setHydrated(true)
    }, [])

    useEffect(() => {
        if (session?.user?.email) {
            // reset Ref if user changed
            if (headerCache.userEmail !== session.user.email) {
                headerCache.avatar = null
                headerCache.avatarLoadedAt = 0
                headerCache.userEmail = session.user.email
                hasLoadedRef.current = false
            }

            // Load logic - Lazy check
            // Admin is now in session
            if (session.user.isAdmin !== undefined) {
                setIsAdmin(!!session.user.isAdmin)
            }

            // Only load avatar once per session mount
            if (!hasLoadedRef.current) {
                hasLoadedRef.current = true
                loadAvatar()
            }
        }
    }, [session?.user?.email, session?.user?.isAdmin, pathname])

    // Load on menu hover/interaction if not already loaded
    const onUserInteraction = () => {
        if (session?.user?.email && !hasLoadedRef.current) {
            hasLoadedRef.current = true
            loadAvatar()
        }
    }

    const loadAvatar = async () => {
        const now = Date.now()
        if (headerCache.avatar !== null && (now - headerCache.avatarLoadedAt) < headerCache.CACHE_DURATION) {
            setCustomAvatar(headerCache.avatar)
            return
        }

        try {
            const response = await fetch('/api/users/avatar')
            if (response.ok) {
                const data = await response.json()
                headerCache.avatar = data.avatar_url
                headerCache.avatarLoadedAt = now
                setCustomAvatar(data.avatar_url)
            }
        } catch (error) { }
    }

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false)
            }
        }
        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showUserMenu])

    // SSR / Initial hydration skeletal state
    if (!hydrated) {
        return (
            <header className="border-b border-gray-200 bg-white relative z-[100]">
                <div className="max-w-full mx-auto">
                    <div className="flex items-center justify-between px-6 h-12 md:h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                                <img src="/logo.svg" alt="textpad logo" width={24} height={24} fetchPriority="high" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 uppercase tracking-widest">textpad</span>
                        </div>
                    </div>
                </div>
            </header>
        )
    }

    // SUBDOMAIN HEADER
    if (onSubdomain) {
        return (
            <header className="border-b border-gray-200 bg-white relative z-[100]">
                <div className="max-w-full mx-auto">
                    <div className="flex items-center justify-between px-6 h-12 md:h-16">
                        <div className="flex items-center gap-3">
                            <a href="https://www.textpad.cloud" className="flex items-center gap-2" title="Textpad">
                                <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    <img src="/logo.svg" alt="textpad logo" width={24} height={24} fetchPriority="high" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">textpad</span>
                            </a>
                        </div>
                        <div className="flex items-center gap-3">
                            <div id="header-actions" />
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

    // MAIN DOMAIN HEADER
    return (
        <>
            <header className={`border-b border-gray-200 bg-white relative z-[100] ${session ? '' : 'hidden xs:block'}`}>
                <div className="max-w-full mx-auto">
                    <div className="flex items-center justify-between px-6 h-12 md:h-16">
                        {/* Left side */}
                        <div className="flex items-center gap-8">
                            <Link href="/" prefetch={false} className="flex items-center gap-3" title={t?.appName || 'TextPad'}>
                                <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    <img src="/logo.svg" alt="textpad logo" width={24} height={24} fetchPriority="high" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-sm font-semibold text-gray-900 uppercase tracking-widest">textpad</span>
                            </Link>

                            <nav className="hidden md:flex items-center gap-6">
                                <Link href="/feed" prefetch={false} title={t?.navFeed || 'Feed'} className={`text-xs font-semibold uppercase tracking-wider transition-colors ${pathname === '/feed' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>{t?.navFeed || 'Feed'}</Link>
                                <Link href="/featured" prefetch={false} title={t?.navFeatured || 'Featured'} className={`text-xs font-semibold uppercase tracking-wider transition-colors ${pathname === '/featured' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>{t?.navFeatured || 'Featured'}</Link>
                            </nav>
                        </div>

                        {/* Center title */}
                        {(pathname === '/feed' || pathname === '/featured') && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900 pointer-events-auto">
                                    {pathname === '/feed' ? (t?.navFeed || 'Feed') :
                                        (t?.navFeatured || 'Featured')}
                                </div>
                            </div>
                        )}

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            <div id="header-actions" className="flex items-center gap-2" />
                            {status === 'loading' && !session ? (
                                <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                            ) : session ? (
                                <>
                                    {isDrive ? (
                                        <Link
                                            href="/"
                                            className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                                            title={t?.newDocument || 'New Document'}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </Link>
                                    ) : !isDoc && !isPublicDynamic && (
                                        <Link
                                            href="/drive"
                                            prefetch={false}
                                            className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                                            title={t?.drive || 'Drive'}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                            </svg>
                                        </Link>
                                    )}

                                    <div className="relative" ref={menuRef}>
                                        <button
                                            onClick={() => { setShowUserMenu(!showUserMenu); onUserInteraction(); }}
                                            onMouseEnter={onUserInteraction}
                                            className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 hover:ring-2 hover:ring-gray-300 transition-all cursor-pointer"
                                        >
                                            {customAvatar ? (
                                                <img src={customAvatar} alt="User" className="w-full h-full object-cover" />
                                            ) : session.user?.image ? (
                                                <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={`https://api.dicebear.com/9.x/croodles/svg?seed=${encodeURIComponent(session.user?.email || 'user')}`} alt="User" className="w-full h-full object-cover" />
                                            )}
                                        </button>

                                        {showUserMenu && (
                                            <div className="absolute right-0 mt-2 w-48 md:w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                                                <Link href="/settings" title={t?.settings || 'Settings'} onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t?.settings || 'Settings'}</Link>
                                                {isAdmin && <Link href="/admin" title={t?.adminPanel || 'Admin Dashboard'} onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t?.admin || 'Admin'}</Link>}
                                                <div className="border-t border-gray-200 my-1" />
                                                <button onClick={() => { setShowUserMenu(false); localStorage.removeItem('openTabs'); signOut({ callbackUrl: '/' }); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t?.signOut || 'Sign out'}</button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : pathname !== '/auth/signin' && (
                                <button
                                    onClick={() => setShowSignInModal(true)}
                                    className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-xs md:text-sm font-medium"
                                >
                                    {t?.signIn || 'Sign in'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Drive Tabs */}
                    {session && (isDrive || isDoc) && (
                        <nav className="flex items-center gap-1 px-6 border-t border-gray-100 overflow-x-auto h-10 md:h-auto">
                            <Link
                                href="/drive"
                                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 flex-shrink-0 ${isDrive && !isDoc ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                            >
                                {t?.drive || 'Drive'}
                            </Link>
                            <Tabs />
                        </nav>
                    )}
                </div>
            </header >

            {/* Sign In Modal */}
            <SignInModal
                isOpen={showSignInModal}
                onClose={() => setShowSignInModal(false)}
            />
        </>
    )
}
