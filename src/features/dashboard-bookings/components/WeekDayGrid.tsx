import { format, isSameDay } from "date-fns"
import { Fragment, useMemo } from "react"

import { AppointmentChip } from "@/features/dashboard-bookings/components/AppointmentChip"
import type { CalendarAppointment } from "@/features/dashboard-bookings/hooks/useCalendarAppointments"
import { hourRows } from "@/lib/calendarUtils"
import { timeStringToMinutes, toDateKey } from "@/features/booking/lib/slotUtils"
import { businessToday, useFormatters } from "@/lib/datetime"
import { cn } from "@/lib/utils"

export function WeekDayGrid({
  days,
  appointments,
  onSelectAppointment,
  onReschedule,
}: {
  days: Date[]
  appointments: CalendarAppointment[]
  onSelectAppointment: (id: string) => void
  onReschedule: (id: string, dateKey: string, hour: number) => void
}) {
  const { locale, formatHour } = useFormatters()
  const today = businessToday()

  const appointmentsByDateHour = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>()
    for (const appointment of appointments) {
      const hour = Math.floor(timeStringToMinutes(appointment.startTime) / 60)
      const key = `${appointment.dateKey}-${hour}`
      const list = map.get(key) ?? []
      list.push(appointment)
      map.set(key, list)
    }
    return map
  }, [appointments])

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <div
        className="grid min-w-[600px]"
        style={{ gridTemplateColumns: `4rem repeat(${days.length}, minmax(120px, 1fr))` }}
      >
        <div className="border-r border-b border-border" />
        {days.map((day) => (
          <div
            key={toDateKey(day)}
            className="border-r border-b border-border p-2 text-center text-sm font-medium last:border-r-0"
          >
            {format(day, "EEE", { locale })}{" "}
            <span
              className={cn(
                "inline-flex size-6 items-center justify-center",
                isSameDay(day, today) && "rounded-full bg-gold text-gold-foreground",
              )}
            >
              {format(day, "d", { locale })}
            </span>
          </div>
        ))}
        {hourRows.map((hour) => (
          <Fragment key={hour}>
            <div className="border-r border-b border-border px-2 py-1 text-right text-xs text-muted-foreground">
              {formatHour(hour)}
            </div>
            {days.map((day) => {
              const dateKey = toDateKey(day)
              const key = `${dateKey}-${hour}`
              const cellAppointments = appointmentsByDateHour.get(key) ?? []
              return (
                <div
                  key={key}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    const id = event.dataTransfer.getData("text/plain")
                    if (id) onReschedule(id, dateKey, hour)
                  }}
                  className="flex min-h-12 flex-col gap-1 border-r border-b border-border p-1 last:border-r-0"
                >
                  {cellAppointments.map((appointment) => (
                    <AppointmentChip
                      key={appointment.id}
                      appointment={appointment}
                      onSelect={onSelectAppointment}
                    />
                  ))}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
