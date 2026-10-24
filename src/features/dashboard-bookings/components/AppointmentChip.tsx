import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import type { CalendarAppointment } from "@/features/dashboard-bookings/hooks/useCalendarAppointments"

import { cn } from "@/lib/utils"
import { useFormatters } from "@/lib/datetime"

const statusVariant = {
  confirmed: "secondary",
  pending: "outline",
  cancelled: "destructive",
} as const

export function AppointmentChip({
  appointment,
  onSelect,
  className,
}: {
  appointment: CalendarAppointment
  onSelect: (id: string) => void
  className?: string
}) {
  const { t } = useTranslation()
  const { formatTime } = useFormatters()

  return (
    <HoverCard openDelay={150} closeDelay={50}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData("text/plain", appointment.id)
            event.dataTransfer.effectAllowed = "move"
          }}
          onClick={() => onSelect(appointment.id)}
          className={cn(
            "flex w-full items-center gap-1.5 truncate rounded-md border border-border px-1.5 py-1 text-left text-xs transition-colors hover:bg-secondary",
            // Read the status at a glance: pending is still tentative, cancelled no longer holds the time.
            appointment.status === "pending" && "border-dashed",
            appointment.status === "cancelled" && "text-muted-foreground line-through opacity-70",
            className,
          )}
        >
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: appointment.staffColor }}
          />
          <span className="truncate">
            {formatTime(appointment.startTime)} &middot; {appointment.customerName}
          </span>
        </button>
      </HoverCardTrigger>

      <HoverCardContent>
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">{appointment.customerName}</span>
          <Badge variant={statusVariant[appointment.status]}>
            {t(`booking.status.${appointment.status}`)}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{appointment.serviceName}</p>
        <p className="text-xs text-muted-foreground">
          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("booking.with", { name: appointment.staffName })}
        </p>
      </HoverCardContent>
    </HoverCard>
  )
}
