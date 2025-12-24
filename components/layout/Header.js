'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import Tabs from './Tabs'
import { useLanguage } from '@/app/i18n/LanguageContext'

// Cache for admin status and avatar to reduce DB calls
const headerCache = {
  adminStatus: null,
  adminCheckedAt: 0,
  avatar: null,
  avatarLoadedAt: 0,
  userEmail: null,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes cache
}

export default function Header() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [customAvatar, setCustomAvatar] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef(null)
  const hasLoadedRef = useRef(false)

  const isDrive = pathname?.startsWith('/drive')
  const isDoc = pathname?.startsWith('/doc')
  const isAdminPage = pathname?.startsWith('/admin')

  useEffect(() => {
    if (session?.user?.email) {
      // Reset cache if user changed
      if (headerCache.userEmail !== session.user.email) {
        headerCache.adminStatus = null
        headerCache.adminCheckedAt = 0
        headerCache.avatar = null
        headerCache.avatarLoadedAt = 0
        headerCache.userEmail = session.user.email
        hasLoadedRef.current = false
      }

      // Only load once per session mount
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true
        checkAdminStatus()
        loadAvatar()
      } else {
        // Use cached values if available
        if (headerCache.adminStatus !== null) {
          setIsAdmin(headerCache.adminStatus)
        }
        if (headerCache.avatar !== null) {
          setCustomAvatar(headerCache.avatar)
        }
      }
    }
  }, [session?.user?.email])

  const loadAvatar = async () => {
    const now = Date.now()
    // Use cache if still valid
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
    } catch (error) {
      // Silently fail
    }
  }

  const checkAdminStatus = async () => {
    const now = Date.now()
    // Use cache if still valid
    if (headerCache.adminStatus !== null && (now - headerCache.adminCheckedAt) < headerCache.CACHE_DURATION) {
      setIsAdmin(headerCache.adminStatus)
      return
    }

    try {
      const response = await fetch('/api/admin/check')
      if (response.ok) {
        const data = await response.json()
        headerCache.adminStatus = data.isAdmin
        headerCache.adminCheckedAt = now
        setIsAdmin(data.isAdmin)
      }
    } catch (error) {
      // Silently fail - user is not admin
      headerCache.adminStatus = false
      headerCache.adminCheckedAt = now
      setIsAdmin(false)
    }
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
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showUserMenu])

  return (
    <header className="border-b border-gray-200 bg-white relative z-[100]">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between px-6 h-16">
          {/* Left side - Logo and project name */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2" title={t?.appName || 'TextPad - Online Text Pad'}>
              <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img
                  src="/padpad.svg"
                  alt="textpad logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium text-gray-900">textpad</span>
            </Link>
            {session && isDrive && (
              <Link
                href="/"
                className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                title={t?.newDocument || 'New Document'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            )}
            {session && !isDrive && !isDoc && (
              <Link
                href="/drive"
                className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                title={t?.drive || 'Drive'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </Link>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {!session && (
              <Link
                href="/auth/signin"
                className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-xs md:text-sm font-medium transition-colors"
                title={t?.signIn || 'Sign in to TextPad'}
              >
                {t?.signIn || 'Sign in'}
              </Link>
            )}
            {session && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 hover:ring-2 hover:ring-gray-300 transition-all cursor-pointer"
                >
                  {customAvatar ? (
                    <img
                      src={customAvatar}
                      alt={session.user?.name || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to default if custom avatar fails to load
                        e.target.src = `https://api.dicebear.com/9.x/croodles/svg?seed=${encodeURIComponent(session.user?.email || session.user?.name || 'user')}`
                      }}
                    />
                  ) : session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={`https://api.dicebear.com/9.x/croodles/svg?seed=${encodeURIComponent(session.user?.email || session.user?.name || 'user')}`}
                      alt={session.user?.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 md:w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                      <div className="py-1">
                        <Link
                          href="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2.5 md:py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          title={t?.settings || 'Settings'}
                        >
                          {t?.settings || 'Settings'}
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className={`block px-4 py-2.5 md:py-2 text-sm transition-colors ${isAdminPage
                                ? 'bg-gray-100 text-gray-900 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            title="Admin Panel"
                          >
                            Admin
                          </Link>
                        )}
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            // Clear tabs before signing out
                            localStorage.removeItem('openTabs')
                            signOut({ callbackUrl: '/' })
                          }}
                          className="block w-full text-left px-4 py-2.5 md:py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          {t?.signOut || 'Sign out'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Secondary navigation tabs and document tabs on same line */}
        {session && (isDrive || isDoc) && (
          <nav className="flex items-center gap-1 px-6 border-t border-gray-100 overflow-x-auto">
            <Link
              href="/drive"
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 flex-shrink-0 ${isDrive && !isDoc
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              title={t?.drive || 'Drive'}
            >
              {t?.drive || 'Drive'}
            </Link>
            <Tabs />
          </nav>
        )}
      </div>
    </header>
  )
}




