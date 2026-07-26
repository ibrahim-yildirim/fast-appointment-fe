import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import { en } from "@/i18n/locales/en"
import { tr } from "@/i18n/locales/tr"

export const supportedLanguages = ["tr", "en"] as const
export type Language = (typeof supportedLanguages)[number]

export const LANGUAGE_STORAGE_KEY = "fast-appointment-language"

/** Turkish is the default; English is opt-in via the header toggle. */
export const defaultLanguage: Language = "tr"

function isSupported(value: string | null): value is Language {
  return value !== null && supportedLanguages.includes(value as Language)
}

function storedLanguage(): Language {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return isSupported(saved) ? saved : defaultLanguage
}

export function resolveLanguage(value: string | undefined): Language {
  return isSupported(value ?? null) ? (value as Language) : defaultLanguage
}

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: storedLanguage(),
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
})

i18n.on("languageChanged", (language) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  document.documentElement.lang = language
})

document.documentElement.lang = i18n.language

export default i18n
