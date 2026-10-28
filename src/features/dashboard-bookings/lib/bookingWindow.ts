import {
  fromDateKey,
  minutesToTimeString,
  timeStringToMinutes,
  toDateKey,
  weekdayForDate,
} from "@/features/booking/lib/slotUtils"
import type { BusinessHours } from "@/types"

export const OWNER_BOOKING_WINDOW_DAYS = 30

export const TIME_STEP_MINUTES = 10

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isDateKey(value: string) {
  if (!DATE_KEY_PATTERN.test(value)) return false
  return toDateKey(fromDateKey(value)) === value
}

export function addDaysToKey(key: string, days: number) {
  const date = fromDateKey(key)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

export function formatDateKey(key: string) {
  if (!isDateKey(key)) return key
  const [year, month, day] = key.split("-")
  return `${day}.${month}.${year}`
}

export function maskDateInput(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`
}

export function maskTimeInput(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}:${digits.slice(2)}`
}

export function parseTypedDate(text: string): string | null {
  const match = text.trim().match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)
  if (!match) return null
  const key = `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`
  return isDateKey(key) ? key : null
}

export function parseTypedTime(text: string): string | null {
  const match = text.trim().match(/^(\d{1,2})[:.]?(\d{2})$/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return minutesToTimeString(hours * 60 + minutes)
}

export function openingHoursFor(hours: BusinessHours[], dateKey: string) {
  if (!isDateKey(dateKey)) return null
  const day = hours.find((candidate) => candidate.day === weekdayForDate(fromDateKey(dateKey)))
  return day?.enabled ? day : null
}

export function timeOptions(
  hours: BusinessHours[],
  dateKey: string,
  durationMinutes: number,
  notBefore?: string,
): string[] {
  const day = openingHoursFor(hours, dateKey)
  if (!day) return []

  const lastStart = timeStringToMinutes(day.end) - durationMinutes
  const earliest = notBefore ? timeStringToMinutes(notBefore) : -1
  const options: string[] = []
  for (let minutes = timeStringToMinutes(day.start); minutes <= lastStart; minutes += TIME_STEP_MINUTES) {
    if (minutes > earliest) options.push(minutesToTimeString(minutes))
  }
  return options
}

export type SlotProblem = {
  field: "date" | "time"
  key: string
  params?: Record<string, string | number>
}

export function slotProblems({
  date,
  time,
  hours,
  minDate,
  maxDate,
  options,
}: {
  date: string
  time: string
  hours: BusinessHours[]
  minDate: string
  maxDate: string
  options: string[]
}): SlotProblem[] {
  if (!isDateKey(date)) return [{ field: "date", key: "dashboard.form.dateInvalid" }]
  if (date < minDate) {
    return [{ field: "date", key: "dashboard.form.dateTooEarly", params: { date: formatDateKey(minDate) } }]
  }
  if (date > maxDate) {
    return [{ field: "date", key: "dashboard.form.dateTooLate", params: { days: OWNER_BOOKING_WINDOW_DAYS } }]
  }
  if (!openingHoursFor(hours, date)) return [{ field: "date", key: "dashboard.form.closedDay" }]

  if (!/^\d{2}:\d{2}$/.test(time)) return [{ field: "time", key: "dashboard.form.timeRequired" }]
  if (timeStringToMinutes(time) % TIME_STEP_MINUTES !== 0) {
    return [{ field: "time", key: "dashboard.form.timeStep" }]
  }
  if (!options.includes(time)) return [{ field: "time", key: "dashboard.form.timeUnavailable" }]
  return []
}
