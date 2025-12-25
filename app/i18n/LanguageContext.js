'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { translations, defaultLocale, locales, getBrowserLocale, localeNames } from './translations'

const LanguageContext = createContext()

export function LanguageProvider({ children, initialLocale }) {
  // Initialize with server-provided locale or default
  const [locale, setLocale] = useState(initialLocale || defaultLocale)
  const [t, setT] = useState(translations[initialLocale] || translations[defaultLocale])
  const [isReady, setIsReady] = useState(false)

  // Sync with localStorage/cookie on mount
  useEffect(() => {
    // Check for textpad_locale cookie (set by /fr and /en pages)
    const cookieMatch = document.cookie.match(/textpad_locale=([^;]+)/)
    const cookieLocale = cookieMatch ? cookieMatch[1] : null

    const savedLocale = localStorage.getItem('locale')
    const browserLocale = getBrowserLocale()

    // Priority: cookie > localStorage > browser > server-provided
    const effectiveLocale = cookieLocale || savedLocale || initialLocale || browserLocale

    console.log('🌐 LanguageProvider init:', { cookieLocale, savedLocale, browserLocale, initialLocale, effectiveLocale })

    if (locales.includes(effectiveLocale)) {
      setLocale(effectiveLocale)
      setT(translations[effectiveLocale])
      document.documentElement.setAttribute('lang', effectiveLocale)
      // Sync localStorage
      localStorage.setItem('locale', effectiveLocale)
    }
    setIsReady(true)
  }, [initialLocale])

  const changeLocale = (newLocale) => {
    console.log('🌐 changeLocale called:', newLocale, '| valid:', locales.includes(newLocale))
    if (locales.includes(newLocale)) {
      console.log('🌐 Setting locale to:', newLocale)
      setLocale(newLocale)
      setT(translations[newLocale])
      localStorage.setItem('locale', newLocale)
      document.documentElement.setAttribute('lang', newLocale)
      // Set cookie for potential server-side usage
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000; samesite=lax`
    }
  }

  return (
    <LanguageContext.Provider value={{ locale, t, changeLocale, locales, localeNames, isReady }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export default LanguageContext

