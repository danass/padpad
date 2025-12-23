'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Tabs from './Tabs'

export default function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [customAvatar, setCustomAvatar] = useState(null)
  
  const isDrive = pathname?.startsWith('/drive')
  const isDoc = pathname?.startsWith('/doc')
  const isAdminPage = pathname?.startsWith('/admin')
  
  useEffect(() => {
    if (session?.user?.email) {
      checkAdminStatus()
      loadAvatar()
    }
  }, [session])
  
  const loadAvatar = async () => {
    try {
      const response = await fetch('/api/users/avatar')
      if (response.ok) {
        const data = await response.json()
        setCustomAvatar(data.avatar_url)
      }
    } catch (error) {
      // Silently fail
    }
  }
  
  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/check')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin)
      }
    } catch (error) {
      // Silently fail - user is not admin
      setIsAdmin(false)
    }
  }
  
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between px-6 h-16">
          {/* Left side - Logo and project name */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded"></div>
              <span className="text-sm font-medium text-gray-900">textpad</span>
            </Link>
            {session && isDrive && (
              <Link
                href="/"
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
              >
                New Document
              </Link>
            )}
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isAdminPage
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Admin
              </Link>
            )}
            {session && (
              <>
                <Link
                  href="/settings"
                  className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 hover:ring-2 hover:ring-gray-300 transition-all cursor-pointer"
                >
                  {customAvatar ? (
                    <img 
                      src={customAvatar} 
                      alt={session.user?.name || 'User'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to default if custom avatar fails to load
                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(session.user?.email || session.user?.name || 'user')}`
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
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(session.user?.email || session.user?.name || 'user')}`}
                      alt={session.user?.name || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </Link>
                <button
                  onClick={() => {
                    // Clear tabs before signing out
                    localStorage.removeItem('openTabs')
                    signOut({ callbackUrl: '/' })
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Secondary navigation tabs and document tabs on same line */}
        {session && (isDrive || isDoc) && (
          <nav className="flex items-center gap-1 px-6 border-t border-gray-100 overflow-x-auto">
            <Link
              href="/drive"
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 flex-shrink-0 ${
                isDrive && !isDoc
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Drive
            </Link>
            <Tabs />
          </nav>
        )}
      </div>
    </header>
  )
}




