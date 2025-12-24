'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none">
      <div className="flex justify-center pb-2">
        <Link
          href="/credits"
          className="pointer-events-auto text-[10px] text-gray-300 hover:text-gray-500 transition-colors"
        >
          •
        </Link>
      </div>
    </footer>
  )
}

