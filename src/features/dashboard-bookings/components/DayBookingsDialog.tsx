import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { CalendarAppointment } from "@/features/dashboard-bookings/hooks/useCalendarAppointments"
import { useFormatters } from "@/lib/datetime"

export function DayBookingsDialog({
  dateKey,
  appointments,
  open,
  onOpenChange,
  onSelectAppointment,
  onCreateBooking,
}: {
  dateKey: string | null
  appointments: CalendarAppointment[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectAppointment: (id: string) => void
  onCreateBooking?: (dateKey: string) => void
}) {
  const { t } = useTranslation()
  const { formatDate, formatTime } = useFormatters()

  if (!dateKey) return null

  const dayAppointments = appointments
    .filter((appointment) => appointment.dateKey === dateKey)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {formatDate(`${dateKey}T00:00:00.000Z`, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </DialogTitle>
          <DialogDescription>{t("dashboard.dayBookingsHint")}</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-2">
          {dayAppointments.map((appointment) => (
            <li key={appointment.id}>
              <button
                type="button"
                onClick={() => onSelectAppointment(appointment.id)}
                className="flex w-full items-center gap-3 rounded-md border border-border p-3 text-left transition-colors hover:bg-secondary"
              >
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: appointment.staffColor }}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium tabular-nums">
                    {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                  </span>
                  <span className="truncate text-sm">{appointment.customerName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {appointment.serviceName} · {appointment.staffName}
                  </span>
                </span>
                <BookingStatusBadge status={appointment.status} />
              </button>
            </li>
          ))}
        </ul>
        {onCreateBooking && (
          <Button variant="outline" onClick={() => onCreateBooking(dateKey)}>
            <Plus data-icon="inline-start" />
            {t("dashboard.newBooking")}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
