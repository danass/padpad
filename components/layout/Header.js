'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Tabs from './Tabs'

export default function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  const isDrive = pathname?.startsWith('/drive')
  const isDoc = pathname?.startsWith('/doc')
  
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between px-6 h-16">
          {/* Left side - Logo and project name */}
          <div className="flex items-center gap-3">
            <Link href="/drive" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded"></div>
              <span className="text-sm font-medium text-gray-900">PadPad</span>
            </Link>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {session?.user?.image && (
              <img 
                src={session.user.image} 
                alt={session.user.name || 'User'} 
                className="w-8 h-8 rounded-full"
              />
            )}
            {session && (
              <button
                onClick={() => {
                  // Clear tabs before signing out
                  localStorage.removeItem('openTabs')
                  signOut({ callbackUrl: '/auth/signin' })
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
              >
                Sign out
              </button>
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


