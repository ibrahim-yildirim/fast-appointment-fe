import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"

import type { CalendarAppointment } from "@/features/dashboard-bookings/hooks/useCalendarAppointments"
import { useTranslation } from "react-i18next"
import { businessTodayKey, useFormatters } from "@/lib/datetime"

type ListSection = "today" | "upcoming" | "past"

const statusVariant = {
  confirmed: "secondary",
  pending: "outline",
  cancelled: "destructive",
  no_show: "outline",
} as const

export function ListView({
  appointments,
  onSelectAppointment,
}: {
  appointments: CalendarAppointment[]
  onSelectAppointment: (id: string) => void
}) {
  const { t } = useTranslation()
  const { formatTime, formatDate } = useFormatters()
  const currentYear = businessTodayKey().slice(0, 4)
  const formatDay = (dateKey: string) =>
    formatDate(`${dateKey}T00:00:00.000Z`, {
      weekday: "long",
      month: "long",
      day: "numeric",
      // Only past bookings can reach into another year; leave the year out otherwise.
      ...(dateKey.slice(0, 4) !== currentYear && { year: "numeric" }),
    })

  const sections = useMemo(() => {
    const todayKey = businessTodayKey()
    const sorted = [...appointments].sort((a, b) =>
      `${a.dateKey}${a.startTime}`.localeCompare(`${b.dateKey}${b.startTime}`),
    )
    const result: { section: ListSection; appointments: CalendarAppointment[] }[] = [
      { section: "today", appointments: sorted.filter((a) => a.dateKey === todayKey) },
      { section: "upcoming", appointments: sorted.filter((a) => a.dateKey > todayKey) },
      // The most recent past visits are the ones an owner looks back at.
      { section: "past", appointments: sorted.filter((a) => a.dateKey < todayKey).reverse() },
    ]
    return result.filter((group) => group.appointments.length > 0)
  }, [appointments])

  if (sections.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
        {t("dashboard.noAppointments")}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {sections.map((group) => (
        <section key={group.section} className="flex flex-col gap-2">
          <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {t(`dashboard.listSections.${group.section}`)}
          </h3>
          {group.appointments.map((appointment) => (
            <button
              key={appointment.id}
              type="button"
              onClick={() => onSelectAppointment(appointment.id)}
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 text-left text-sm hover:bg-secondary"
            >
              <div className="flex items-center gap-3">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: appointment.staffColor }}
                />
                <div>
                  <div className="font-medium">
                    {formatDay(appointment.dateKey)} &middot; {formatTime(appointment.startTime)}
                  </div>
                  <p className="text-muted-foreground">
                    {appointment.customerName} &middot; {appointment.serviceName} &middot;{" "}
                    {t("booking.with", { name: appointment.staffName })}
                  </p>
                </div>
              </div>
              <Badge variant={statusVariant[appointment.status]}>
                {t(`booking.status.${appointment.status}`)}
              </Badge>
            </button>
          ))}
        </section>
      ))}
    </div>
  )
}
