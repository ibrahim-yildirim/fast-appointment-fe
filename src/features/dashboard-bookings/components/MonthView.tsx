import { format, isSameDay, isSameMonth } from "date-fns"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"

import { AppointmentChip } from "@/features/dashboard-bookings/components/AppointmentChip"
import type { CalendarAppointment } from "@/features/dashboard-bookings/hooks/useCalendarAppointments"
import { getMonthGridDays } from "@/lib/calendarUtils"
import { toDateKey } from "@/features/booking/lib/slotUtils"
import { weekdayOrder } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { businessToday, useFormatters } from "@/lib/datetime"

const VISIBLE_LIMIT = 3

export function MonthView({
  referenceDate,
  appointments,
  onSelectAppointment,
  onReschedule,
  previewsDisabled,
  onShowMore,
  onDayClick,
}: {
  referenceDate: Date
  appointments: CalendarAppointment[]
  onSelectAppointment: (id: string) => void
  onReschedule: (id: string, dateKey: string) => void
  onShowMore: (date: Date) => void
  previewsDisabled: boolean
  onDayClick: (dateKey: string) => void
}) {
  const { t } = useTranslation()
  const { locale } = useFormatters()
  const today = businessToday()
  const todayKey = toDateKey(today)

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
          {t(`weekdayShort.${day}`)}
        </div>
      ))}
      {days.map((day) => {
        const dateKey = toDateKey(day)
        const dayAppointments = appointmentsByDate.get(dateKey) ?? []
        const visible = dayAppointments.slice(0, VISIBLE_LIMIT)
        const overflow = dayAppointments.length - visible.length
        const hasBookings = dayAppointments.length > 0
        const dayLabel = format(day, "d MMMM", { locale })

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
              "relative flex min-h-24 min-w-0 flex-col gap-1 bg-background p-0.5 sm:p-1",
              !isSameMonth(day, referenceDate) && "bg-muted/30 text-muted-foreground",
            )}
          >
            {(hasBookings || dateKey >= todayKey) && (
              <button
                type="button"
                aria-label={
                  hasBookings
                    ? t("dashboard.dayBookingsOn", { date: dayLabel })
                    : t("dashboard.newBookingOn", { date: dayLabel })
                }
                onClick={() => onDayClick(dateKey)}
                className="group/day absolute inset-0 flex cursor-pointer items-center justify-center hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                {!hasBookings && (
                  <Plus
                    aria-hidden="true"
                    className="size-5 text-muted-foreground opacity-40 transition-opacity sm:opacity-0 sm:group-hover/day:opacity-100 sm:group-focus-visible/day:opacity-100"
                  />
                )}
              </button>
            )}
            <span
              className={cn(
                "pointer-events-none relative flex size-6 items-center justify-center text-xs",
                isSameDay(day, today) &&
                  "rounded-full bg-gold font-semibold text-gold-foreground",
              )}
            >
              {format(day, "d", { locale })}
            </span>
            {visible.map((appointment) => (
              <div key={appointment.id} className="relative min-w-0">
                <AppointmentChip
                  appointment={appointment}
                  onSelect={onSelectAppointment}
                  previewDisabled={previewsDisabled}
                />
              </div>
            ))}
            {overflow > 0 && (
              <button
                type="button"
                onClick={() => onShowMore(day)}
                className="relative self-start text-left text-xs text-muted-foreground hover:text-foreground"
              >
                {t("dashboard.showMore", { count: overflow })}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
