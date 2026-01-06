/**
 * Translations Metadata for TextPad
 * 
 * Individual language files are stored in ./locales/
 */

export const locales = ['en', 'fr', 'es', 'zh', 'ru', 'sv']

export const defaultLocale = 'en'

export const localeNames = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  zh: '中文',
  ru: 'Русский',
  sv: 'Svenska',
}

/**
 * Get browser locale
 */
export function getBrowserLocale() {
  if (typeof window === 'undefined') return defaultLocale

  const browserLang = navigator.language || navigator.userLanguage
  const shortLang = browserLang.split('-')[0]

  if (locales.includes(shortLang)) {
    return shortLang
  }

  return defaultLocale
}
