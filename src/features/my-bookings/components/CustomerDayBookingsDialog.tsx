import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { CustomerBookingView } from "@/features/my-bookings/api/customerBookingsApi"
import { useFormatters } from "@/lib/datetime"

export function CustomerDayBookingsDialog({
  dateKey,
  bookings,
  open,
  onOpenChange,
  onSelectBooking,
  canBookNew,
}: {
  dateKey: string | null
  bookings: CustomerBookingView[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectBooking: (id: string) => void
  canBookNew: boolean
}) {
  const { t } = useTranslation()
  const { formatDate, formatTime } = useFormatters()

  if (!dateKey) return null

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
          <DialogDescription>{t("account.dayBookingsHint")}</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-2">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <button
                type="button"
                onClick={() => onSelectBooking(booking.id)}
                className="flex w-full items-center gap-3 rounded-md border border-border p-3 text-left transition-colors hover:bg-secondary"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium tabular-nums">
                    {formatTime(booking.startsAt.slice(11, 16))} -{" "}
                    {formatTime(booking.endsAt.slice(11, 16))}
                  </span>
                  <span className="truncate text-sm">{booking.businessName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {booking.serviceName} · {booking.staffName}
                  </span>
                </span>
                <BookingStatusBadge status={booking.status} />
              </button>
            </li>
          ))}
        </ul>
        {canBookNew && (
          <Button variant="outline" asChild>
            <Link to="/businesses">
              <Plus data-icon="inline-start" />
              {t("account.bookNew")}
            </Link>
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
