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
import type { Service } from "@/types"

const SLOT_INTERVAL_MINUTES = 30

export type SlotOption = {
  time: string
  staffId: string
}

export function useAvailableSlots(businessId: string, service: Service | undefined, date: Date) {
  const dateKey = toDateKey(date)

  return useQuery({
    queryKey: ["available-slots", businessId, service?.id, dateKey],
    enabled: Boolean(service),
    queryFn: async (): Promise<SlotOption[]> => {
      if (!service) return []

      const allStaff = await staffApi.list(businessId)
      const eligibleStaff = allStaff.filter((member) =>
        service.eligibleStaffIds.includes(member.id),
      )
      const weekday = weekdayForDate(date)

      const staffRanges = await Promise.all(
        eligibleStaff.map(async (member) => {
          const [weekly, timeOff] = await Promise.all([
            availabilityApi.getWeekly(businessId, member.id),
            availabilityApi.listTimeOff(businessId, member.id),
          ])
          const hasTimeOff = timeOff.some((entry) => entry.date === dateKey)
          if (hasTimeOff) return { staffId: member.id, ranges: [] }

          const day = weekly.find((entry) => entry.day === weekday)
          if (!day?.enabled) return { staffId: member.id, ranges: [] }
          return { staffId: member.id, ranges: day.ranges }
        }),
      )

      const businessBookings = await bookingsApi.list(businessId)
      const dayBookings = businessBookings.filter(
        (booking) => booking.status !== "cancelled" && booking.startsAt.startsWith(dateKey),
      )

      const slots = new Map<string, string>()
      const nowMs = Date.now()

      for (const { staffId, ranges } of staffRanges) {
        for (const range of ranges) {
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
              if (booking.staffId !== staffId) return false
              const bookingStart = timeStringToMinutes(booking.startsAt.slice(11, 16))
              const bookingEnd = timeStringToMinutes(booking.endsAt.slice(11, 16))
              return slotStart < bookingEnd && slotEnd > bookingStart
            })

            if (!conflict) slots.set(time, staffId)
          }
        }
      }

      return [...slots.entries()]
        .map(([time, staffId]) => ({ time, staffId }))
        .sort((a, b) => a.time.localeCompare(b.time))
    },
  })
}
