import { computed, reactive } from 'vue'
import { i18n, setI18nLocale } from '../../i18n'
import { SUPPORTED_LOCALES } from '../../i18n/localeMap'
import { isRtlLocale } from '../../i18n/rtl'

const LOCALE_LABELS = {
  ar: 'Arabic',
  bn: 'Bengali',
  de: 'German',
  en: 'English',
  es: 'Spanish',
  fa: 'Farsi/Persian',
  fr: 'French',
  he: 'Hebrew',
  hi: 'Hindi',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  ms: 'Malay',
  nl: 'Dutch',
  pl: 'Polish',
  pt: 'Portuguese',
  pt_BR: 'Brazilian Portuguese',
  ru: 'Russian',
  sw: 'Swahili',
  ta: 'Tamil',
  th: 'Thai',
  tl: 'Tagalog',
  tr: 'Turkish',
  uk: 'Ukrainian',
  ur: 'Urdu',
  vi: 'Vietnamese',
  zh_CN: '简体中文',
  zh_TW: '繁体中文'
}

const state = reactive({
  locale: i18n.global.locale.value
})

export const localeStore = {
  state,
  supportedLocales: SUPPORTED_LOCALES.map((code) => ({
    code,
    label: LOCALE_LABELS[code] || code
  })),
  isRTL: computed(() => isRtlLocale(state.locale)),
  setLocale(locale) {
    state.locale = setI18nLocale(locale)
    return state.locale
  }
}

