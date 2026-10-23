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

export function groupSlotsByHour<T extends { time: string }>(slots: T[]) {
  const groups = new Map<number, T[]>()

  for (const slot of slots) {
    const hour = Math.floor(timeStringToMinutes(slot.time) / 60)
    const existing = groups.get(hour)
    if (existing) {
      existing.push(slot)
    } else {
      groups.set(hour, [slot])
    }
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([hour, hourSlots]) => ({ hour, slots: hourSlots }))
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
