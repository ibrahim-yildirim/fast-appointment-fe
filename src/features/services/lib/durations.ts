import type { TFunction } from "i18next"

import { SLOT_INTERVAL_MINUTES } from "@/lib/constants"

export const minServiceDuration = SLOT_INTERVAL_MINUTES
export const maxServiceDuration = 240

/** Every valid service length: 10 min up to 4 hours, in booking-interval steps. */
export const serviceDurationOptions = Array.from(
  { length: maxServiceDuration / SLOT_INTERVAL_MINUTES },
  (_, index) => (index + 1) * SLOT_INTERVAL_MINUTES,
)

/**
 * The lengths businesses reach for most often, offered as one-tap chips. Everything
 * else is still reachable through the stepper.
 */
export const commonServiceDurations = [10, 20, 30, 40, 60, 90, 120]

/** `"50 dk"` / `"1 sa 30 dk"` in Turkish, `"50 min"` / `"1 hr 30 min"` in English. */
export function formatDurationLabel(minutes: number, t: TFunction) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) return t("duration.minutes", { value: minutes })
  if (remainingMinutes === 0) return t("duration.hours", { value: hours })
  return t("duration.hoursMinutes", { hours, minutes: remainingMinutes })
}
