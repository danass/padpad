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
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {/* Show Feed and Featured links when not logged in */}
        {!session && (
          <div className="flex items-center gap-4">
            <Link href="/feed" prefetch={false} title={t?.navFeed || 'Feed'} className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
              {t?.navFeed || 'Feed'}
            </Link>
            <Link href="/featured" prefetch={false} title={t?.navFeatured || 'Featured'} className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
              {t?.navFeatured || 'Featured'}
            </Link>
          </div>
        )}
        {/* Legal links - always visible */}
        <Link href="/privacy" prefetch={false} title={t?.privacy || 'Privacy'} className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
          {t?.privacy || 'Privacy'}
        </Link>
        <Link href="/terms" prefetch={false} title={t?.terms || 'Terms'} className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
          {t?.terms || 'Terms'}
        </Link>
        <Link href="/credits" prefetch={false} title={t?.credits || 'Credits'} className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
          {t?.credits || 'Credits'}
        </Link>
        <LanguageSelector compact />
      </div>
    </footer>
  )
}
