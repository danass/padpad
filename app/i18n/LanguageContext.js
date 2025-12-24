'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { translations, defaultLocale, locales, getBrowserLocale, localeNames } from './translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  // Initialize with default, will be updated on client
  const [locale, setLocale] = useState(defaultLocale)
  const [t, setT] = useState(translations[defaultLocale])
  const [isReady, setIsReady] = useState(false)

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale')
    const browserLocale = getBrowserLocale()
    const effectiveLocale = savedLocale || browserLocale
    
    console.log('🌐 LanguageProvider init:', { savedLocale, browserLocale, effectiveLocale })
    
    if (locales.includes(effectiveLocale)) {
      setLocale(effectiveLocale)
      setT(translations[effectiveLocale])
      document.documentElement.setAttribute('lang', effectiveLocale)
    }
    setIsReady(true)
  }, [])

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

