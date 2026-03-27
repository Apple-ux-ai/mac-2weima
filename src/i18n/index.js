import { createI18n } from 'vue-i18n'
import { LOCALE_STORAGE_KEY, normalizeLocale, SUPPORTED_LOCALES } from './localeMap'
import { applyDocumentDirection } from './rtl'

// 一次性加载所有 messages/*.json 语言包（与 translate_locales 生成的文件一致）
const messageModules = import.meta.glob('./messages/*.json', { eager: true })
const loadedMessages = {}
for (const path of Object.keys(messageModules)) {
  const name = path.replace(/^.*[/\\]/, '').replace(/\.json$/, '')
  if (SUPPORTED_LOCALES.includes(name)) {
    const mod = messageModules[path]
    loadedMessages[name] = (mod && mod.default) ? mod.default : mod || {}
  }
}

const resolveInitialLocale = () => {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCALE_STORAGE_KEY) : null
  const browser = typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage) : null
  return normalizeLocale(stored || browser || 'zh_CN')
}

const initialLocale = resolveInitialLocale()

// 回退顺序：当前语言 -> 中文 -> 英文
const fallbackByLocale = {
  en: loadedMessages.en || {},
  zh_CN: loadedMessages.zh_CN || {}
}

const messages = SUPPORTED_LOCALES.reduce((acc, locale) => {
  acc[locale] = loadedMessages[locale] || {}
  return acc
}, {})

const missingKeys = new Set()

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: ['en', 'zh_CN'],
  messages,
  missingWarn: false,
  fallbackWarn: false,
  missing: (locale, key) => {
    const token = `${locale}:${key}`
    if (!missingKeys.has(token)) {
      missingKeys.add(token)
      console.warn('[i18n-missing]', token)
    }
    return loadFallbackMessage(locale, key)
  }
})

export const setI18nLocale = (locale) => {
  const normalized = normalizeLocale(locale)
  i18n.global.locale.value = normalized
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCALE_STORAGE_KEY, normalized)
  }
  applyDocumentDirection(normalized)
  return normalized
}

export const loadFallbackMessage = (locale, keyPath) => {
  const parts = keyPath.split('.')
  const tryRoot = (root) => {
    let cursor = root
    for (const part of parts) {
      cursor = cursor?.[part]
      if (cursor === undefined) return undefined
    }
    return typeof cursor === 'string' ? cursor : undefined
  }
  return tryRoot(fallbackByLocale.zh_CN) ?? tryRoot(fallbackByLocale.en) ?? keyPath
}

applyDocumentDirection(initialLocale)

