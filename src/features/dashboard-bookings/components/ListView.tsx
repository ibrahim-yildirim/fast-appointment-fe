import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"

import type { CalendarAppointment } from "@/features/dashboard-bookings/hooks/useCalendarAppointments"
import { useTranslation } from "react-i18next"
import { useFormatters } from "@/lib/datetime"

const statusVariant = {
  confirmed: "secondary",
  pending: "outline",
  cancelled: "destructive",
} as const

export function ListView({
  appointments,
  onSelectAppointment,
}: {
  appointments: CalendarAppointment[]
  onSelectAppointment: (id: string) => void
}) {
  const { t } = useTranslation()
  const { formatTime } = useFormatters()

  const sorted = useMemo(
    () =>
      [...appointments].sort((a, b) =>
        `${a.dateKey}${a.startTime}`.localeCompare(`${b.dateKey}${b.startTime}`),
      ),
    [appointments],
  )

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
        {t("dashboard.noAppointments")}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((appointment) => (
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
                {appointment.dateKey} &middot; {formatTime(appointment.startTime)}
              </div>
              <p className="text-muted-foreground">
                {appointment.customerName} &middot; {appointment.serviceName} &middot;{" "}
                {t("booking.with", { name: appointment.staffName })}
              </p>
            </div>
          </div>
          <Badge variant={statusVariant[appointment.status]}>{appointment.status}</Badge>
        </button>
      ))}
    </div>
  )
}
