import type { Slot } from "@/features/booking/api/slotsApi"
import { bookingsApi } from "@/features/booking/api/bookingsApi"
import {
  fromDateKey,
  minutesToTimeString,
  timeStringToMinutes,
  toDateKey,
  weekdayForDate,
} from "@/features/booking/lib/slotUtils"
import { availabilityApi } from "@/features/staff-calendar/api/availabilityApi"
import { staffApi } from "@/features/staff-calendar/api/staffApi"
import { SLOT_INTERVAL_MINUTES } from "@/lib/constants"
import { businessNow } from "@/lib/datetime"
import type { Booking, BusinessRef, DayAvailability, Service, TimeOffException } from "@/types"

type StaffSchedule = {
  staffId: string
  weekly: DayAvailability[]
  timeOff: TimeOffException[]
}

/**
 * Fixture-mode stand-in for the backend slots endpoint. It needs every booking of the
 * business, which is fine for in-memory fixtures but must never happen against a real API.
 */
export async function fixtureSlots(
  business: BusinessRef,
  service: Service,
  from: string,
  to: string,
): Promise<Slot[]> {
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

  const slots: Slot[] = []
  for (let date = fromDateKey(from); toDateKey(date) <= to; date.setDate(date.getDate() + 1)) {
    slots.push(...buildSlotsForDate(service, new Date(date), staffSchedules, bookings))
  }
  return slots
}

function buildSlotsForDate(
  service: Service,
  date: Date,
  staffSchedules: StaffSchedule[],
  bookings: Booking[],
): Slot[] {
  const dateKey = toDateKey(date)
  const weekday = weekdayForDate(date)
  const dayBookings = bookings.filter(
    (booking) => booking.status !== "cancelled" && booking.startsAt.startsWith(dateKey),
  )

  const slots = new Map<string, string>()
  const nowMs = businessNow().getTime()

  for (const schedule of staffSchedules) {
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
    .map(([time, staffId]) => ({ date: dateKey, time, staffId, status: "available" as const }))
    .sort((a, b) => a.time.localeCompare(b.time))
}
