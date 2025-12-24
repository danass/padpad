'use client'

import Link from 'next/link'

export default function CreditsPage() {
  return (
    <div className="flex-1 bg-white flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-light text-gray-900 mb-6">
          textpad
        </h1>
        
        <p className="text-gray-600 mb-4">
          Made with care by{' '}
          <a 
            href="https://danielassayag.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-900 hover:underline"
          >
            Daniel Assayag
          </a>
        </p>
        
        <p className="text-sm text-gray-400 mb-8">
          Brother app of{' '}
          <a 
            href="https://instapan.pix" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:underline"
          >
            instapan.pix
          </a>
        </p>
        
        <Link 
          href="/" 
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← back
        </Link>
      </div>
    </div>
  )
}

