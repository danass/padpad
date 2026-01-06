'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { defaultLocale, locales, getBrowserLocale, localeNames } from './translations'

const LanguageContext = createContext()

// Cache for loaded translations to avoid redundant fetches
const translationsCache = {}

const loadTranslations = async (locale) => {
  if (translationsCache[locale]) return translationsCache[locale]

  try {
    const translations = await import(`./locales/${locale}.json`)
    translationsCache[locale] = translations.default
    return translations.default
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error)
    // Fallback to English if loading fails
    if (locale !== 'en') return loadTranslations('en')
    return {}
  }
}

export function LanguageProvider({ children, initialLocale }) {
  const [locale, setLocale] = useState(initialLocale || defaultLocale)
  const [t, setT] = useState({})
  const [isReady, setIsReady] = useState(false)

  const applyLocale = useCallback(async (newLocale) => {
    const translations = await loadTranslations(newLocale)
    setT(translations)
    setLocale(newLocale)
    document.documentElement.setAttribute('lang', newLocale)
    setIsReady(true)
  }, [])

  // Initial load
  useEffect(() => {
    const init = async () => {
      // Check for ?locale= URL param
      const urlParams = new URLSearchParams(window.location.search)
      const urlLocale = urlParams.get('locale')

      if (urlLocale && locales.includes(urlLocale)) {
        document.cookie = `textpad_locale=${urlLocale}; path=/; max-age=31536000; samesite=lax`
        localStorage.setItem('locale', urlLocale)
        await applyLocale(urlLocale)

        // Clean URL
        urlParams.delete('locale')
        const newUrl = urlParams.toString()
          ? `${window.location.pathname}?${urlParams.toString()}`
          : window.location.pathname
        window.history.replaceState({}, '', newUrl)
        return
      }

      // Priority: cookie > localStorage > browser > initial (from server)
      const cookieMatch = document.cookie.match(/textpad_locale=([^;]+)/)
      const cookieLocale = cookieMatch ? cookieMatch[1] : null
      const savedLocale = localStorage.getItem('locale')
      const browserLocale = getBrowserLocale()

      let effectiveLocale = cookieLocale || savedLocale || initialLocale || browserLocale
      if (!locales.includes(effectiveLocale)) effectiveLocale = defaultLocale

      await applyLocale(effectiveLocale)
      if (effectiveLocale !== savedLocale) {
        localStorage.setItem('locale', effectiveLocale)
      }
    }

    init()
  }, [initialLocale, applyLocale])

  const changeLocale = async (newLocale) => {
    if (locales.includes(newLocale)) {
      setIsReady(false)
      await applyLocale(newLocale)
      localStorage.setItem('locale', newLocale)
      document.cookie = `textpad_locale=${newLocale}; path=/; max-age=31536000; samesite=lax`
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

