import { enUS, tr } from "date-fns/locale"
import { useTranslation } from "react-i18next"

import { resolveLanguage, type Language } from "@/i18n"

/**
 * The whole product runs on Turkish business hours. Times are shown in Istanbul
 * regardless of the visitor's device timezone or the selected language.
 */
export const BUSINESS_TIME_ZONE = "Europe/Istanbul"

const localeTags: Record<Language, string> = {
  tr: "tr-TR",
  en: "en-US",
}

const dateFnsLocales = { tr, en: enUS }

export function dateFnsLocale(language: Language) {
  return dateFnsLocales[language]
}

const businessPartsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})

/**
 * "Now" as Istanbul wall-clock, expressed as a Date whose *UTC* fields hold that
 * wall-clock reading. Booking times are stored the same way
 * (`2026-07-27T14:10:00.000Z` means 14:10 in Istanbul), so the two compare
 * directly. Derived from Intl parts rather than offset arithmetic, so DST is
 * handled for us.
 */
export function businessNow(): Date {
  const parts = businessPartsFormatter.formatToParts(new Date())
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)

  // Istanbul midnight renders as hour 24 in some runtimes; normalise to 0.
  const hour = value("hour") % 24

  return new Date(
    Date.UTC(value("year"), value("month") - 1, value("day"), hour, value("minute"), value("second")),
  )
}

/** Istanbul's current calendar day as `YYYY-MM-DD`. */
export function businessTodayKey(): string {
  return businessNow().toISOString().slice(0, 10)
}

/**
 * Istanbul's current calendar day as a *local*-midnight Date.
 *
 * Deliberately a different flavour from {@link businessNow}: calendar code
 * (react-day-picker, date-fns, `toDateKey`) reads local fields, so a day value
 * has to carry Istanbul's Y/M/D in those. Use this for day selection and
 * "not before today" bounds; use `businessNow()` only to compare instants
 * against stored timestamps.
 */
export function businessToday(): Date {
  const now = businessNow()
  return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
}

/** `"14:10"` in Turkish, `"2:10 PM"` in English. */
export function formatTime(time: string, language: Language) {
  const [hours, minutes] = time.split(":").map(Number)

  if (language === "tr") {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  }

  const period = hours >= 12 ? "PM" : "AM"
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`
}

/** Hour-only label for the slot picker: `"14:00"` in Turkish, `"2 PM"` in English. */
export function formatHour(hour: number, language: Language) {
  if (language === "tr") return `${String(hour).padStart(2, "0")}:00`

  const period = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12} ${period}`
}

/**
 * Stored timestamps are Istanbul wall-clock pinned to `Z`, so they're read back
 * with `timeZone: "UTC"` — that renders the stored reading verbatim instead of
 * shifting it into the viewer's zone.
 */
export function formatDate(
  value: Date | string,
  language: Language,
  options: Intl.DateTimeFormatOptions,
) {
  const date = typeof value === "string" ? new Date(value) : value
  return date.toLocaleDateString(localeTags[language], { ...options, timeZone: "UTC" })
}

export function formatMoney(amount: number, language: Language) {
  return new Intl.NumberFormat(localeTags[language], {
    style: "currency",
    currency: "TRY",
    // en-US spells TRY out as "TRY 55.00" without this; we want ₺ in both languages.
    currencyDisplay: "narrowSymbol",
    // "₺250" reads better than "₺250,00"; kuruş only show up when a price actually has them.
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)
}

/** Binds every formatter to the active language so components don't thread it through. */
export function useFormatters() {
  const { i18n } = useTranslation()
  const language = resolveLanguage(i18n.language)

  return {
    language,
    locale: dateFnsLocale(language),
    formatTime: (time: string) => formatTime(time, language),
    formatHour: (hour: number) => formatHour(hour, language),
    formatDate: (value: Date | string, options: Intl.DateTimeFormatOptions) =>
      formatDate(value, language, options),
    formatMoney: (amount: number) => formatMoney(amount, language),
  }
}
