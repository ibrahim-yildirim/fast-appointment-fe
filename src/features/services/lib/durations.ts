import type { TFunction } from "i18next"

// Independent of the slot grid: a 50-minute service still starts on the 30-minute grid.
export const serviceDurationStep = 10
export const minServiceDuration = serviceDurationStep
export const maxServiceDuration = 240

/** Every valid service length: 10 min up to 4 hours, in 10-minute steps. */
export const serviceDurationOptions = Array.from(
  { length: maxServiceDuration / serviceDurationStep },
  (_, index) => (index + 1) * serviceDurationStep,
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
