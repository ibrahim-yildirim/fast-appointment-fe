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

export function toRole(role: BackendRole): Role {
  return role === "BUSINESS_OWNER" ? "business_owner" : "customer"
}

export function toWeekday(day: BackendDay): Weekday {
  return dayToWeekday[day]
}

/** The backend sends "09:00:00"; the UI works with "09:00". */
export function toHourMinute(time: string | null): string {
  return time ? time.slice(0, 5) : ""
}
