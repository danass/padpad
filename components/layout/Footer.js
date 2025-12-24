'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full py-4 mt-auto">
      <div className="flex justify-center">
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

