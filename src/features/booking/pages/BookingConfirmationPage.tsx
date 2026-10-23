import { CheckCircle2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useCustomerBooking } from "@/features/my-bookings/hooks/useCustomerBooking"
import { useFormatters } from "@/lib/datetime"

export function BookingConfirmationPage() {
  const { t } = useTranslation()
  const { formatDate, formatTime } = useFormatters()
  const business = useBusinessContext()
  const { bookingId } = useParams<{ bookingId: string }>()
  const { data: booking, isLoading } = useCustomerBooking(bookingId!)

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  if (!booking) {
    return <p className="text-muted-foreground">{t("booking.notFound")}</p>
  }

  const startsAt = new Date(booking.startsAt)

  return (
    <Card className="max-w-md">
      <h1 className="sr-only">{t("booking.confirmedTitle")}</h1>
      <CardHeader className="items-center text-center">
        <CheckCircle2 aria-hidden="true" className="h-10 w-10 text-primary" />
        <CardTitle>{t("booking.confirmedTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 text-center text-sm">
          <span className="font-medium">{booking.serviceName}</span>
          <span className="text-muted-foreground">
            {t("booking.with", { name: booking.staffName })}
          </span>
          <span className="text-muted-foreground">
            {formatDate(startsAt, { weekday: "long", month: "long", day: "numeric" })}{" "}
            {t("booking.at")}{" "}
            {formatTime(booking.startsAt.slice(11, 16))}
          </span>
        </div>
        {booking.reference && (
          <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/30 p-4 text-center">
            <span className="text-xs text-muted-foreground uppercase">{t("booking.reference")}</span>
            <span className="font-mono text-lg font-semibold tracking-wider">
              {booking.reference}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link to="/account/bookings">{t("booking.viewMyBookings")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/${business.slug}/book`}>{t("booking.bookAnother")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
