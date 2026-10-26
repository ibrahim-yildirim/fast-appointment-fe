import { useState } from "react"
import { useTranslation } from "react-i18next"

import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import type { CalendarAppointment } from "@/features/dashboard-bookings/hooks/useCalendarAppointments"

import { cn } from "@/lib/utils"
import { useFormatters } from "@/lib/datetime"

export function AppointmentChip({
  appointment,
  onSelect,
  previewDisabled = false,
  className,
}: {
  appointment: CalendarAppointment
  onSelect: (id: string) => void
  // True while a booking dialog is open: a late hover timer would otherwise pop the preview over it.
  previewDisabled?: boolean
  className?: string
}) {
  const { t } = useTranslation()
  const { formatTime } = useFormatters()
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <HoverCard
      open={previewOpen && !previewDisabled}
      onOpenChange={(open) => {
        if (open && previewDisabled) return
        setPreviewOpen(open)
      }}
      openDelay={150}
      closeDelay={50}
    >
      <HoverCardTrigger asChild>
        <button
          type="button"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData("text/plain", appointment.id)
            event.dataTransfer.effectAllowed = "move"
          }}
          onClick={() => {
            setPreviewOpen(false)
            onSelect(appointment.id)
          }}
          className={cn(
            "flex w-full items-center gap-1.5 truncate rounded-md border border-border px-0.5 py-1 text-left text-[11px] transition-colors hover:bg-secondary sm:px-1.5 sm:text-xs",
            // Read the status at a glance: pending is still tentative, cancelled no longer holds the time.
            appointment.status === "pending" && "border-dashed",
            appointment.status === "cancelled" && "text-muted-foreground line-through opacity-70",
            appointment.status === "no_show" && "text-muted-foreground opacity-70",
            className,
          )}
        >
          <span
            className="hidden size-2 shrink-0 rounded-full sm:block"
            style={{ backgroundColor: appointment.staffColor }}
          />
          {/* Phone-width month cells only fit the time; the name is in the detail dialog. */}
          <span className="truncate">
            {formatTime(appointment.startTime)}
            <span className="hidden sm:inline"> &middot; {appointment.customerName}</span>
          </span>
        </button>
      </HoverCardTrigger>

      <HoverCardContent>
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">{appointment.customerName}</span>
          <BookingStatusBadge status={appointment.status} />
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
