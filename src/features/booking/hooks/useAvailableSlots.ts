import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { bookingsApi } from "@/features/booking/api/bookingsApi"
import {
  minutesToTimeString,
  timeStringToMinutes,
  toDateKey,
  weekdayForDate,
} from "@/features/booking/lib/slotUtils"
import { availabilityApi } from "@/features/staff-calendar/api/availabilityApi"
import { staffApi } from "@/features/staff-calendar/api/staffApi"
import { SLOT_INTERVAL_MINUTES } from "@/lib/constants"
import { businessNow, businessToday } from "@/lib/datetime"
import type { Booking, BusinessRef, DayAvailability, Service, TimeOffException } from "@/types"

/** How far ahead to look for a day with openings before giving up. */
const NEXT_AVAILABLE_SEARCH_DAYS = 60

export type SlotOption = {
  time: string
  staffId: string
}

type StaffSchedule = {
  staffId: string
  weekly: DayAvailability[]
  timeOff: TimeOffException[]
}

type SchedulingData = {
  staffSchedules: StaffSchedule[]
  bookings: Booking[]
}

/**
 * Everything slot generation needs, none of it date-specific — so one fetch
 * answers "what's open?" for any number of days.
 */
async function fetchSchedulingData(
  business: BusinessRef,
  service: Service,
): Promise<SchedulingData> {
  const allStaff = await staffApi.list(business)
  const eligibleStaff = allStaff.filter((member) => service.eligibleStaffIds.includes(member.id))

  const [staffSchedules, bookings] = await Promise.all([
    Promise.all(
      eligibleStaff.map(async (member) => {
        const [weekly, timeOff] = await Promise.all([
          availabilityApi.getWeekly(business.id, member.id),
          availabilityApi.listTimeOff(business.id, member.id),
        ])
        return { staffId: member.id, weekly, timeOff }
      }),
    ),
    bookingsApi.list(business.id),
  ])

  return { staffSchedules, bookings }
}

function buildSlotsForDate(service: Service, date: Date, data: SchedulingData): SlotOption[] {
  const dateKey = toDateKey(date)
  const weekday = weekdayForDate(date)
  const dayBookings = data.bookings.filter(
    (booking) => booking.status !== "cancelled" && booking.startsAt.startsWith(dateKey),
  )

  const slots = new Map<string, string>()
  const nowMs = businessNow().getTime()

  for (const schedule of data.staffSchedules) {
    if (schedule.timeOff.some((entry) => entry.date === dateKey)) continue

    const day = schedule.weekly.find((entry) => entry.day === weekday)
    if (!day?.enabled) continue

    for (const range of day.ranges) {
      const rangeEnd = timeStringToMinutes(range.end)
      for (
        let cursor = timeStringToMinutes(range.start);
        cursor + service.durationMinutes <= rangeEnd;
        cursor += SLOT_INTERVAL_MINUTES
      ) {
        const slotStart = cursor
        const slotEnd = cursor + service.durationMinutes
        const time = minutesToTimeString(slotStart)
        if (slots.has(time)) continue

        // Slot times are wall-clock strings persisted as UTC (see BookingConfirmPage),
        // so compare the same way to drop times that have already passed today.
        if (new Date(`${dateKey}T${time}:00.000Z`).getTime() <= nowMs) continue

        const conflict = dayBookings.some((booking) => {
          if (booking.staffId !== schedule.staffId) return false
          const bookingStart = timeStringToMinutes(booking.startsAt.slice(11, 16))
          const bookingEnd = timeStringToMinutes(booking.endsAt.slice(11, 16))
          return slotStart < bookingEnd && slotEnd > bookingStart
        })

        if (!conflict) slots.set(time, schedule.staffId)
      }
    }
  }

  return [...slots.entries()]
    .map(([time, staffId]) => ({ time, staffId }))
    .sort((a, b) => a.time.localeCompare(b.time))
}

function useSchedulingData(business: BusinessRef, service: Service | undefined) {
  return useQuery({
    queryKey: ["scheduling-data", business.id, service?.id],
    enabled: Boolean(service),
    queryFn: () => fetchSchedulingData(business, service!),
  })
}

export function useAvailableSlots(business: BusinessRef, service: Service | undefined, date: Date) {
  const { data, isLoading } = useSchedulingData(business, service)

  const slots = useMemo(
    () => (service && data ? buildSlotsForDate(service, date, data) : undefined),
    [service, data, date],
  )

  return { data: slots, isLoading }
}

/**
 * First day from today with at least one open slot, so the picker doesn't land
 * on an empty day. `null` once the search window is exhausted.
 */
export function useNextAvailableDate(business: BusinessRef, service: Service | undefined) {
  const { data, isLoading } = useSchedulingData(business, service)

  const nextDate = useMemo(() => {
    if (!service || !data) return undefined

    const start = businessToday()

    for (let offset = 0; offset < NEXT_AVAILABLE_SEARCH_DAYS; offset++) {
      const candidate = new Date(start)
      candidate.setDate(start.getDate() + offset)
      if (buildSlotsForDate(service, candidate, data).length > 0) return candidate
    }

    return null
  }, [service, data])

  return { data: nextDate, isLoading }
}
