import { CheckIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BookingSummary } from "@/features/booking/components/BookingSummary"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useCustomerBooking } from "@/features/my-bookings/hooks/useCustomerBooking"
import { useFormatters } from "@/lib/datetime"

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

  return (
    <div className="flex max-w-md flex-col gap-8">
      <div className="flex flex-col items-start gap-4">
        <span
          aria-hidden="true"
          className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full"
        >
          <CheckIcon className="size-6" strokeWidth={2.5} />
        </span>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("booking.confirmedTitle")}
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
        ]}
      />

      {booking.reference && (
        <div className="bg-muted/60 flex flex-col gap-1 rounded-lg p-4">
          <span className="text-muted-foreground text-sm">{t("booking.reference")}</span>
          <span className="font-mono text-lg font-semibold tracking-wider">
            {booking.reference}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button size="xl" asChild>
          <Link to="/account/bookings">{t("booking.viewMyBookings")}</Link>
        </Button>
        <Button size="xl" variant="outline" asChild>
          <Link to={`/${business.slug}/book`}>{t("booking.bookAnother")}</Link>
        </Button>
      </div>
    </div>
  )
}
