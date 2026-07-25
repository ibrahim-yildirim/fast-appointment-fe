import { format, isSameMonth, isToday } from "date-fns"
import { useMemo } from "react"

import { AppointmentChip } from "@/features/dashboard-bookings/components/AppointmentChip"
import type { CalendarAppointment } from "@/features/dashboard-bookings/hooks/useCalendarAppointments"
import { getMonthGridDays } from "@/lib/calendarUtils"
import { toDateKey } from "@/features/booking/lib/slotUtils"
import { weekdayOrder, weekdayShortLabels } from "@/lib/constants"
import { cn } from "@/lib/utils"

const VISIBLE_LIMIT = 3

export function MonthView({
  referenceDate,
  appointments,
  onSelectAppointment,
  onReschedule,
  onShowMore,
}: {
  referenceDate: Date
  appointments: CalendarAppointment[]
  onSelectAppointment: (id: string) => void
  onReschedule: (id: string, dateKey: string) => void
  onShowMore: (date: Date) => void
}) {
  const days = useMemo(() => getMonthGridDays(referenceDate), [referenceDate])

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>()
    for (const appointment of appointments) {
      const list = map.get(appointment.dateKey) ?? []
      list.push(appointment)
      map.set(appointment.dateKey, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.startTime.localeCompare(b.startTime))
    return map
  }, [appointments])

  return (
    <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
      {weekdayOrder.map((day) => (
        <div key={day} className="bg-muted px-2 py-1 text-center text-xs font-medium text-muted-foreground">
          {weekdayShortLabels[day]}
        </div>
      ))}
      {days.map((day) => {
        const dateKey = toDateKey(day)
        const dayAppointments = appointmentsByDate.get(dateKey) ?? []
        const visible = dayAppointments.slice(0, VISIBLE_LIMIT)
        const overflow = dayAppointments.length - visible.length

        return (
          <div
            key={dateKey}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              const id = event.dataTransfer.getData("text/plain")
              if (id) onReschedule(id, dateKey)
            }}
            className={cn(
              "flex min-h-24 flex-col gap-1 bg-background p-1",
              !isSameMonth(day, referenceDate) && "bg-muted/30 text-muted-foreground",
            )}
          >
            <span className={cn("text-xs", isToday(day) && "font-semibold text-foreground")}>
              {format(day, "d")}
            </span>
            {visible.map((appointment) => (
              <AppointmentChip
                key={appointment.id}
                appointment={appointment}
                onSelect={onSelectAppointment}
              />
            ))}
            {overflow > 0 && (
              <button
                type="button"
                onClick={() => onShowMore(day)}
                className="text-left text-xs text-muted-foreground hover:text-foreground"
              >
                +{overflow} more
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
