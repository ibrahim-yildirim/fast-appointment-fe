import { CheckIcon, ClockIcon, PrinterIcon, XIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BookingSummary } from "@/features/booking/components/BookingSummary"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { googleCalendarUrl, type CalendarEvent } from "@/features/booking/lib/calendarExport"
import { useCustomerBooking } from "@/features/my-bookings/hooks/useCustomerBooking"
import { useFormatters } from "@/lib/datetime"
import { cn } from "@/lib/utils"

export function BookingConfirmationPage() {
  const { t } = useTranslation()
  const { formatDate, formatTime, formatMoney } = useFormatters()
  const business = useBusinessContext()
  const { bookingId } = useParams<{ bookingId: string }>()
  const { data: booking, isLoading } = useCustomerBooking(bookingId!)

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  if (!booking) {
    return <p className="text-muted-foreground">{t("booking.notFound")}</p>
  }

  const cancelled = booking.status === "cancelled"
  const StatusIcon = cancelled ? XIcon : booking.status === "pending" ? ClockIcon : CheckIcon

  const location = [booking.businessName, business.address].filter(Boolean).join(", ")
  const calendarEvent: CalendarEvent = {
    title: `${booking.serviceName} · ${booking.businessName}`,
    details: t("booking.with", { name: booking.staffName }),
    location,
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
  }

  return (
    <div className="flex max-w-md flex-col gap-8">
      <div className="flex flex-col items-start gap-4">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-12 items-center justify-center rounded-full",
            booking.status === "confirmed"
              ? "bg-gold text-gold-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          <StatusIcon className="size-6" strokeWidth={2.5} />
        </span>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {t(`booking.statusTitle.${booking.status}`)}
        </h1>
      </div>

      <BookingSummary
        rows={[
          { label: t("booking.summary.service"), value: booking.serviceName },
          { label: t("booking.summary.staff"), value: booking.staffName },
          {
            label: t("booking.summary.date"),
            value: formatDate(booking.startsAt, { weekday: "long", month: "long", day: "numeric" }),
          },
          {
            label: t("booking.summary.time"),
            value: formatTime(booking.startsAt.slice(11, 16)),
            emphasis: true,
          },
          { label: t("booking.summary.price"), value: formatMoney(booking.price), emphasis: true },
          {
            label: t("booking.summary.place"),
            value: (
              <>
                {booking.businessName}
                {business.address && (
                  <span className="text-muted-foreground block font-normal">
                    {business.address}
                  </span>
                )}
              </>
            ),
          },
        ]}
      />

      {!cancelled && (
        <div className="flex flex-col gap-3 print:hidden">
          <h2 className="text-muted-foreground text-sm font-medium">
            {t("booking.addToCalendar")}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <a href={googleCalendarUrl(calendarEvent)} target="_blank" rel="noreferrer">
                Google Calendar
              </a>
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap print:hidden">
        <Button size="xl" asChild>
          <Link to="/account/bookings">{t("booking.viewMyBookings")}</Link>
        </Button>
        <Button size="xl" variant="outline" onClick={() => window.print()}>
          <PrinterIcon aria-hidden="true" />
          {t("booking.print")}
        </Button>
        <Button size="xl" variant="outline" asChild>
          <Link to={`/${business.slug}/book`}>{t("booking.bookAnother")}</Link>
        </Button>
      </div>
    </div>
  )
}
