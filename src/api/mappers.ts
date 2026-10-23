import type { Role, Weekday } from "@/types"

export type BackendRole = "CUSTOMER" | "BUSINESS_OWNER"

export type BackendDay =
  "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY"

const dayToWeekday: Record<BackendDay, Weekday> = {
  MONDAY: "mon",
  TUESDAY: "tue",
  WEDNESDAY: "wed",
  THURSDAY: "thu",
  FRIDAY: "fri",
  SATURDAY: "sat",
  SUNDAY: "sun",
}

export function toId(id: number): string {
  return String(id)
}

export function toBackendId(id: string): number {
  return Number(id)
}

export function toRole(role: BackendRole): Role {
  return role === "BUSINESS_OWNER" ? "business_owner" : "customer"
}

export function toWeekday(day: BackendDay): Weekday {
  return dayToWeekday[day]
}

export function toBackendDay(weekday: Weekday): BackendDay {
  return (Object.keys(dayToWeekday) as BackendDay[]).find((day) => dayToWeekday[day] === weekday)!
}

/**
 * The backend sends naive business-local times ("2026-10-26T10:00:00"); the UI keeps
 * wall-clock times as "...Z" strings and only ever slices them, so no zone math happens.
 */
export function toWallClock(dateTime: string): string {
  return `${dateTime.length === 16 ? `${dateTime}:00` : dateTime.slice(0, 19)}.000Z`
}

export function toBusinessLocal(wallClock: string): string {
  return wallClock.slice(0, 19)
}

/** The backend sends "09:00:00"; the UI works with "09:00". */
export function toHourMinute(time: string | null): string {
  return time ? time.slice(0, 5) : ""
}
