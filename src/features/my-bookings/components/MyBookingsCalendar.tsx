import { format, isSameDay, isSameMonth } from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { toDateKey } from "@/features/booking/lib/slotUtils"
import type { CustomerBookingView } from "@/features/my-bookings/api/customerBookingsApi"
import { BookingDetailDialog } from "@/features/my-bookings/components/BookingDetailDialog"
import { CustomerDayBookingsDialog } from "@/features/my-bookings/components/CustomerDayBookingsDialog"
import { getMonthGridDays, navigateDate } from "@/lib/calendarUtils"
import { weekdayOrder } from "@/lib/constants"
import { businessToday } from "@/lib/datetime"
import { cn } from "@/lib/utils"
import { useFormatters } from "@/lib/datetime"

const statusDot = {
  confirmed: "bg-foreground",
  pending: "bg-muted-foreground",
  cancelled: "bg-destructive",
  no_show: "bg-muted-foreground",
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
    <HoverCard openDelay={150} closeDelay={50}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={() => onSelect(booking.id)}
          className={cn(
            "flex w-full items-center gap-1.5 truncate rounded-md border border-border px-1.5 py-1 text-left text-xs transition-colors hover:bg-secondary",
            // Same status cues as the owner calendar.
            booking.status === "pending" && "border-dashed",
            booking.status === "cancelled" && "text-muted-foreground line-through opacity-70",
            booking.status === "no_show" && "text-muted-foreground opacity-70",
          )}
        >
          <span className={cn("size-2 shrink-0 rounded-full", statusDot[booking.status])} />
          <span className="truncate">
            {formatTime(booking.startsAt.slice(11, 16))} &middot; {booking.businessName}
          </span>
        </button>
      </HoverCardTrigger>

      <HoverCardContent>
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">{booking.serviceName}</span>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{booking.businessName}</p>
        <p className="text-xs text-muted-foreground">
          {formatTime(booking.startsAt.slice(11, 16))} -{" "}
          {formatTime(booking.endsAt.slice(11, 16))}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("booking.with", { name: booking.staffName })}
        </p>
      </HoverCardContent>
    </HoverCard>
  )
}

export function MyBookingsCalendar({ bookings }: { bookings: CustomerBookingView[] }) {
  const { t } = useTranslation()
  const { locale } = useFormatters()
  const navigate = useNavigate()
  const today = businessToday()
  const todayKey = toDateKey(today)
  const [referenceDate, setReferenceDate] = useState(() => businessToday())
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [dayDialogDateKey, setDayDialogDateKey] = useState<string | null>(null)

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
          const hasBookings = dayBookings.length > 0
          const dayLabel = format(day, "d MMMM", { locale })

          return (
            <div
              key={dateKey}
              className={cn(
                "relative flex min-h-24 flex-col gap-1 bg-background p-1",
                !isSameMonth(day, referenceDate) && "bg-muted/30 text-muted-foreground",
              )}
            >
              {(hasBookings || dateKey >= todayKey) && (
                <button
                  type="button"
                  aria-label={
                    hasBookings
                      ? t("account.dayBookingsOn", { date: dayLabel })
                      : t("account.bookOn", { date: dayLabel })
                  }
                  onClick={() =>
                    hasBookings ? setDayDialogDateKey(dateKey) : navigate("/businesses")
                  }
                  className="absolute inset-0 cursor-pointer hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                />
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
              {dayBookings.map((booking) => (
                <div key={booking.id} className="relative min-w-0">
                  <BookingChip booking={booking} onSelect={setSelectedBookingId} />
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <CustomerDayBookingsDialog
        dateKey={dayDialogDateKey}
        bookings={dayDialogDateKey ? (bookingsByDate.get(dayDialogDateKey) ?? []) : []}
        open={dayDialogDateKey !== null}
        onOpenChange={(open) => !open && setDayDialogDateKey(null)}
        onSelectBooking={(id) => {
          setDayDialogDateKey(null)
          setSelectedBookingId(id)
        }}
        canBookNew={dayDialogDateKey !== null && dayDialogDateKey >= todayKey}
      />

      <BookingDetailDialog
        booking={bookings.find((booking) => booking.id === selectedBookingId) ?? null}
        open={selectedBookingId !== null}
        onOpenChange={(open) => !open && setSelectedBookingId(null)}
      />
    </div>
  )
}
