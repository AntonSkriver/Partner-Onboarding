export const locales = ['en', 'da', 'es', 'it'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  da: 'Dansk',
  es: 'Español',
  it: 'Italiano',
}

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  da: '🇩🇰',
  es: '🇪🇸',
  it: '🇮🇹',
}
