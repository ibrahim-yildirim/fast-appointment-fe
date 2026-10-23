import { weekdayOrder } from "@/lib/constants"

export function weekdayForDate(date: Date) {
  const jsDay = date.getDay()
  return weekdayOrder[(jsDay + 6) % 7]
}

export function timeStringToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

export function minutesToTimeString(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

const dayParts = [
  { key: "morning", until: 12 * 60 },
  { key: "afternoon", until: 17 * 60 },
  { key: "evening", until: 24 * 60 },
] as const

export type DayPart = (typeof dayParts)[number]["key"]

/** Morning (before 12:00), afternoon (until 17:00) and evening; empty parts are left out. */
export function groupSlotsByDayPart<T extends { time: string }>(slots: T[]) {
  return dayParts
    .map((part, index) => {
      const from = index === 0 ? 0 : dayParts[index - 1].until
      const partSlots = slots.filter((slot) => {
        const minutes = timeStringToMinutes(slot.time)
        return minutes >= from && minutes < part.until
      })
      return { part: part.key as DayPart, slots: partSlots }
    })
    .filter((group) => group.slots.length > 0)
}

/** Inverse of {@link toDateKey}: a local-midnight Date, the same flavour as `businessToday()`. */
export function fromDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
