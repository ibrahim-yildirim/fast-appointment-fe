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

export function formatTimeLabel(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`
}

export function formatHourLabel(hour: number) {
  const period = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12} ${period}`
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

export function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
