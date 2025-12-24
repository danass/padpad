'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex justify-center pb-3">
        <Link
          href="/credits"
          className="pointer-events-auto text-[8px] text-gray-400 hover:text-gray-600 transition-colors opacity-50 hover:opacity-100"
        >
          ●
        </Link>
      </div>
    </footer>
  )
}

