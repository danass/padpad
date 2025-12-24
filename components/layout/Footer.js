'use client'

import Link from 'next/link'
import LanguageSelector from '@/components/ui/LanguageSelector'

export default function Footer() {
  return (
    <footer className="w-full py-4 mt-auto">
      <div className="flex items-center justify-center gap-4">
        <LanguageSelector compact />
        <Link
          href="/features"
          className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          Features
        </Link>
        <Link
          href="/credits"
          className="text-[8px] text-gray-300 hover:text-gray-500 transition-colors"
        >
          ●
        </Link>
      </div>
    </footer>
  )
}
