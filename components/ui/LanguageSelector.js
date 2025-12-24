'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/app/i18n/LanguageContext'
import { Globe } from 'lucide-react'

export default function LanguageSelector({ compact = false }) {
  const { locale, changeLocale, locales, localeNames, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors ${
          compact ? 'p-1' : 'px-2 py-1'
        }`}
        title={t?.language || 'Language'}
      >
        <Globe className="w-4 h-4" />
        {!compact && (
          <span className="text-sm">{locale.toUpperCase()}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px] z-50">
            <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
              {t?.language || 'Language'}
            </div>
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  console.log('Changing locale to:', loc)
                  changeLocale(loc)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                  locale === loc 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{localeNames[loc]}</span>
                {locale === loc && (
                  <span className="w-1.5 h-1.5 rounded-full bg-black" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

