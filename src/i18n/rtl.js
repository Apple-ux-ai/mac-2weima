import { toIntlLocale } from './localeMap'

const RTL_LOCALES = new Set(['ar', 'he', 'ur', 'fa'])

export const isRtlLocale = (locale) => RTL_LOCALES.has(locale)

export const applyDocumentDirection = (locale) => {
  if (typeof document === 'undefined') return
  const rtl = isRtlLocale(locale)
  document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr')
  document.documentElement.setAttribute('lang', toIntlLocale(locale))
  document.body?.setAttribute('dir', rtl ? 'rtl' : 'ltr')
}

