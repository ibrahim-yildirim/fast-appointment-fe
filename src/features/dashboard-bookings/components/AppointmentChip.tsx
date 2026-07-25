import { Badge } from "@/components/ui/badge"
import type { CalendarAppointment } from "@/features/dashboard-bookings/hooks/useCalendarAppointments"
import { formatTimeLabel } from "@/features/booking/lib/slotUtils"
import { cn } from "@/lib/utils"

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
  return (
    <div className="group/chip relative">
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
          className,
        )}
      >
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: appointment.staffColor }}
        />
        <span className="truncate">
          {formatTimeLabel(appointment.startTime)} &middot; {appointment.customerName}
        </span>
      </button>

      <div className="invisible absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-border bg-popover p-3 text-popover-foreground opacity-0 shadow-md ring-1 ring-foreground/10 transition-opacity group-hover/chip:visible group-hover/chip:opacity-100">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">{appointment.customerName}</span>
          <Badge variant={statusVariant[appointment.status]}>{appointment.status}</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{appointment.serviceName}</p>
        <p className="text-xs text-muted-foreground">
          {formatTimeLabel(appointment.startTime)} - {formatTimeLabel(appointment.endTime)}
        </p>
        <p className="text-xs text-muted-foreground">with {appointment.staffName}</p>
      </div>
    </div>
  )
}
