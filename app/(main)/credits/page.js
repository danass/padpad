'use client'

import Link from 'next/link'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function CreditsPage() {
  const { t } = useLanguage()
  
  return (
    <div className="flex-1 bg-white flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-light text-gray-900 mb-6">
          textpad
        </h1>
        
        <p className="text-gray-600 mb-4">
          {t?.madeBy || 'Made with care by'}{' '}
          <a 
            href="https://danpm.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-900 hover:underline"
          >
            Daniel Assayag
          </a>
        </p>
        
        <p className="text-sm text-gray-400 mb-8">
          {t?.brotherApp || 'Brother app of'}{' '}
          <a 
            href="https://instapan.pics" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:underline"
          >
            instapan.pics
          </a>
        </p>
        
        <Link 
          href="/" 
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← {t?.back || 'back'}
        </Link>
      </div>
    </div>
  )
}

