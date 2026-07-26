import { format, isSameMonth, isToday } from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toDateKey } from "@/features/booking/lib/slotUtils"
import type { CustomerBookingView } from "@/features/my-bookings/api/customerBookingsApi"
import { BookingDetailDialog } from "@/features/my-bookings/components/BookingDetailDialog"
import { getMonthGridDays, navigateDate } from "@/lib/calendarUtils"
import { weekdayOrder } from "@/lib/constants"
import { businessToday } from "@/lib/datetime"
import { cn } from "@/lib/utils"
import { useFormatters } from "@/lib/datetime"

const statusVariant = {
  confirmed: "secondary",
  pending: "outline",
  cancelled: "destructive",
} as const

const statusDot = {
  confirmed: "bg-foreground",
  pending: "bg-muted-foreground",
  cancelled: "bg-destructive",
} as const

function BookingChip({
  booking,
  onSelect,
}: {
  booking: CustomerBookingView
  onSelect: (id: string) => void
}) {
  const { t } = useTranslation()
  const { formatTime } = useFormatters()

  return (
    <div className="group/chip relative">
      <button
        type="button"
        onClick={() => onSelect(booking.id)}
        className="flex w-full items-center gap-1.5 truncate rounded-md border border-border px-1.5 py-1 text-left text-xs transition-colors hover:bg-secondary"
      >
        <span className={cn("size-2 shrink-0 rounded-full", statusDot[booking.status])} />
        <span className="truncate">
          {formatTime(booking.startsAt.slice(11, 16))} &middot; {booking.businessName}
        </span>
      </button>

      <div className="invisible absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-border bg-popover p-3 text-popover-foreground opacity-0 shadow-md ring-1 ring-foreground/10 transition-opacity group-hover/chip:visible group-hover/chip:opacity-100">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">{booking.serviceName}</span>
          <Badge variant={statusVariant[booking.status]}>{t(`booking.status.${booking.status}`)}</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{booking.businessName}</p>
        <p className="text-xs text-muted-foreground">
          {formatTime(booking.startsAt.slice(11, 16))} -{" "}
          {formatTime(booking.endsAt.slice(11, 16))}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("booking.with", { name: booking.staffName })}
        </p>
      </div>
    </div>
  )
}

export function MyBookingsCalendar({ bookings }: { bookings: CustomerBookingView[] }) {
  const { t } = useTranslation()
  const { locale } = useFormatters()
  const [referenceDate, setReferenceDate] = useState(() => businessToday())
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  const days = useMemo(() => getMonthGridDays(referenceDate), [referenceDate])

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, CustomerBookingView[]>()
    for (const booking of bookings) {
      const dateKey = booking.startsAt.slice(0, 10)
      const list = map.get(dateKey) ?? []
      list.push(booking)
      map.set(dateKey, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    return map
  }, [bookings])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setReferenceDate(businessToday())}>
          {t("account.today")}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("account.previousMonth")}
          onClick={() => setReferenceDate((current) => navigateDate(current, "month", "prev"))}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("account.nextMonth")}
          onClick={() => setReferenceDate((current) => navigateDate(current, "month", "next"))}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{format(referenceDate, "MMMM yyyy", { locale })}</span>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {weekdayOrder.map((day) => (
          <div
            key={day}
            className="bg-muted px-2 py-1 text-center text-xs font-medium text-muted-foreground"
          >
            {t(`weekdayShort.${day}`)}
          </div>
        ))}
        {days.map((day) => {
          const dateKey = toDateKey(day)
          const dayBookings = bookingsByDate.get(dateKey) ?? []

          return (
            <div
              key={dateKey}
              className={cn(
                "flex min-h-24 flex-col gap-1 bg-background p-1",
                !isSameMonth(day, referenceDate) && "bg-muted/30 text-muted-foreground",
              )}
            >
              <span className={cn("text-xs", isToday(day) && "font-semibold text-foreground")}>
                {format(day, "d", { locale })}
              </span>
              {dayBookings.map((booking) => (
                <BookingChip
                  key={booking.id}
                  booking={booking}
                  onSelect={setSelectedBookingId}
                />
              ))}
            </div>
          )
        })}
      </div>

      <BookingDetailDialog
        booking={bookings.find((booking) => booking.id === selectedBookingId) ?? null}
        open={selectedBookingId !== null}
        onOpenChange={(open) => !open && setSelectedBookingId(null)}
      />
    </div>
  )
}
