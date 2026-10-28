import type { Booking, BusinessHours, Service, Weekday } from "@/types"

export type PeriodStats = {
  bookings: number
  revenue: number
  cancellations: number
  noShowRate: number | null
}

export type ServiceCount = { name: string; count: number }

export type BusyCell = { hour: number; count: number; open: boolean; services: ServiceCount[] }


export type BusyRow = { day: Weekday; cells: BusyCell[] }

export const BUSY_WEEKS = 8

const DAY_MS = 24 * 60 * 60 * 1000

export const weekdays: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

function weekdayOf(date: Date): Weekday {
  return weekdays[(date.getUTCDay() + 6) % 7]
}

function serviceCounts(bookings: Booking[], services: Service[]): ServiceCount[] {
  const counts = new Map<string, number>()
  for (const booking of bookings) {
    const name = services.find((service) => service.id === booking.serviceId)?.name ?? "—"
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

function monthStart(now: Date, offset: number): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1))
}

function statsBetween(
  bookings: Booking[],
  priceOf: (booking: Booking) => number,
  from: Date,
  to: Date,
  now: Date,
): PeriodStats {
  const inPeriod = bookings.filter((booking) => {
    const startsAt = new Date(booking.startsAt)
    return startsAt >= from && startsAt < to
  })
  const kept = inPeriod.filter((booking) => booking.status !== "cancelled")
  const happened = kept.filter((booking) => new Date(booking.startsAt) <= now)
  const noShows = happened.filter((booking) => booking.status === "no_show").length

  return {
    bookings: kept.length,
    revenue: happened
      .filter((booking) => booking.status !== "no_show")
      .reduce((sum, booking) => sum + priceOf(booking), 0),
    cancellations: inPeriod.length - kept.length,
    noShowRate: happened.length === 0 ? null : Math.round((noShows / happened.length) * 100),
  }
}

export function monthStats(
  bookings: Booking[],
  services: Service[],
  now: Date,
): { current: PeriodStats; previous: PeriodStats } {
  const priceOf = (booking: Booking) =>
    services.find((service) => service.id === booking.serviceId)?.price ?? 0

  return {
    current: statsBetween(bookings, priceOf, monthStart(now, 0), monthStart(now, 1), now),
    previous: statsBetween(bookings, priceOf, monthStart(now, -1), monthStart(now, 0), now),
  }
}

function toHour(time: string, roundUp: boolean): number {
  const [hours, minutes] = time.split(":").map(Number)
  return roundUp && minutes > 0 ? hours + 1 : hours
}

export function busiestTimes(
  bookings: Booking[],
  services: Service[],
  hours: BusinessHours[],
  now: Date,
): { hours: number[]; rows: BusyRow[]; max: number } | null {
  const openDays = hours.filter((day) => day.enabled)
  if (openDays.length === 0) return null

  const firstHour = Math.min(...openDays.map((day) => toHour(day.start, false)))
  const lastHour = Math.max(...openDays.map((day) => toHour(day.end, true)))
  const hourList = Array.from({ length: lastHour - firstHour }, (_, index) => firstHour + index)

  const from = new Date(now.getTime() - BUSY_WEEKS * 7 * DAY_MS)
  const byCell = new Map<string, Booking[]>()
  for (const booking of bookings) {
    const startsAt = new Date(booking.startsAt)
    if (booking.status === "cancelled" || startsAt < from || startsAt > now) continue
    const key = `${weekdayOf(startsAt)}-${startsAt.getUTCHours()}`
    byCell.set(key, [...(byCell.get(key) ?? []), booking])
  }

  const rows = weekdays.map((day) => {
    const dayHours = hours.find((candidate) => candidate.day === day)
    return {
      day,
      cells: hourList.map((hour) => ({
        hour,
        count: byCell.get(`${day}-${hour}`)?.length ?? 0,
        services: serviceCounts(byCell.get(`${day}-${hour}`) ?? [], services),
        open:
          !!dayHours?.enabled &&
          hour >= toHour(dayHours.start, false) &&
          hour < toHour(dayHours.end, true),
      })),
    }
  })

  const max = Math.max(0, ...[...byCell.values()].map((cell) => cell.length))
  return { hours: hourList, rows, max }
}
