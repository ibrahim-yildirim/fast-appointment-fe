import type { TFunction } from "i18next"

import { SLOT_INTERVAL_MINUTES } from "@/lib/constants"

const MAX_SERVICE_MINUTES = 240

/** Selectable service lengths: 10 min up to 4 hours, in booking-interval steps. */
export const serviceDurationOptions = Array.from(
  { length: MAX_SERVICE_MINUTES / SLOT_INTERVAL_MINUTES },
  (_, index) => (index + 1) * SLOT_INTERVAL_MINUTES,
)

/** `"50 dk"` / `"1 sa 30 dk"` in Turkish, `"50 min"` / `"1 hr 30 min"` in English. */
export function formatDurationLabel(minutes: number, t: TFunction) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) return t("duration.minutes", { value: minutes })
  if (remainingMinutes === 0) return t("duration.hours", { value: hours })
  return t("duration.hoursMinutes", { hours, minutes: remainingMinutes })
}
