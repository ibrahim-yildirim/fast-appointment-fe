import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns"

export type CalendarView = "month" | "week" | "day" | "list"

export const dayStartHour = 8
export const dayEndHour = 20
export const hourRows = Array.from(
  { length: dayEndHour - dayStartHour },
  (_, index) => dayStartHour + index,
)

export function getMonthGridDays(reference: Date): Date[] {
  const start = startOfWeek(startOfMonth(reference), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(reference), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function getWeekDays(reference: Date): Date[] {
  const start = startOfWeek(reference, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end: addDays(start, 6) })
}

export function navigateDate(reference: Date, view: CalendarView, direction: "prev" | "next") {
  if (direction === "prev") {
    if (view === "month") return subMonths(reference, 1)
    if (view === "week") return subWeeks(reference, 1)
    return subDays(reference, 1)
  }
  if (view === "month") return addMonths(reference, 1)
  if (view === "week") return addWeeks(reference, 1)
  return addDays(reference, 1)
}
