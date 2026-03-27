import { toIntlLocale } from './localeMap'

export const formatDateTime = (value, locale) => {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString(toIntlLocale(locale || 'zh_CN'))
  } catch (error) {
    return new Date(value).toLocaleString()
  }
}

