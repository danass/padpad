'use client'

import Link from 'next/link'
import LanguageSelector from '@/components/ui/LanguageSelector'

export default function Footer() {
  return (
    <footer className="w-full py-4 mt-auto">
      <div className="flex items-center justify-center gap-4">
        <LanguageSelector compact />
      </div>
    </footer>
  )
}
