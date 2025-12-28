'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import LanguageSelector from '@/components/ui/LanguageSelector'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function Footer() {
  const { data: session } = useSession() || {}
  const { t } = useLanguage()

  return (
    <footer className="w-full py-4 mt-auto">
      <div className="flex items-center justify-center gap-4">
        {/* Show Feed, Featured and Credits links on mobile when not logged in */}
        {!session && (
          <div className="flex items-center gap-4 xs:hidden">
            <Link href="/feed" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
              {t?.navFeed || 'Feed'}
            </Link>
            <Link href="/featured" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
              {t?.navFeatured || 'Featured'}
            </Link>
            <Link href="/credits" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
              {t?.credits || 'Credits'}
            </Link>
          </div>
        )}
        <LanguageSelector compact />
      </div>
    </footer>
  )
}
