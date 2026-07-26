import { SLOT_INTERVAL_MINUTES } from "@/lib/constants"

const MAX_SERVICE_MINUTES = 240

/** Selectable service lengths: 10 min up to 4 hours, in booking-interval steps. */
export const serviceDurationOptions = Array.from(
  { length: MAX_SERVICE_MINUTES / SLOT_INTERVAL_MINUTES },
  (_, index) => (index + 1) * SLOT_INTERVAL_MINUTES,
)

export function formatDurationLabel(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) return `${minutes} min`
  if (remainingMinutes === 0) return `${hours} hr`
  return `${hours} hr ${remainingMinutes} min`
}
