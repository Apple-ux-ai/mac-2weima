// 顺序影响语言下拉列表展示；常用语言靠前
export const SUPPORTED_LOCALES = [
  'zh_CN',
  'en',
  'zh_TW',
  'ar',
  'bn',
  'de',
  'es',
  'fa',
  'fr',
  'he',
  'hi',
  'id',
  'it',
  'ja',
  'ko',
  'ms',
  'nl',
  'pl',
  'pt',
  'pt_BR',
  'ru',
  'sw',
  'ta',
  'th',
  'tl',
  'tr',
  'uk',
  'ur',
  'vi'
]

export const LOCALE_STORAGE_KEY = 'app_locale'

export const normalizeLocale = (input) => {
  if (!input) return 'zh_CN'
  const raw = String(input).trim()
  if (SUPPORTED_LOCALES.includes(raw)) return raw
  const lowered = raw.toLowerCase()
  if (lowered === 'zh-cn' || lowered === 'zh_hans') return 'zh_CN'
  if (lowered === 'zh-tw' || lowered === 'zh_hant') return 'zh_TW'
  if (lowered === 'pt-br' || lowered === 'pt_br') return 'pt_BR'
  const hit = SUPPORTED_LOCALES.find((x) => x.toLowerCase() === lowered)
  return hit || 'zh_CN'
}

export const toIntlLocale = (locale) => {
  if (locale === 'pt_BR') return 'pt-BR'
  if (locale === 'zh_CN') return 'zh-CN'
  if (locale === 'zh_TW') return 'zh-TW'
  return locale
}

