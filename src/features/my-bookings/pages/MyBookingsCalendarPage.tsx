import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MyBookingsCalendar } from "@/features/my-bookings/components/MyBookingsCalendar"
import { useCustomerBookings } from "@/features/my-bookings/hooks/useCustomerBookings"

export function MyBookingsCalendarPage() {
  const { t } = useTranslation()
  const { data: bookings, isLoading } = useCustomerBookings()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t("account.calendar")}</h1>
          <p className="text-sm text-muted-foreground">{t("account.calendarSubtitle")}</p>
        </div>
        <Button asChild>
          <Link to="/businesses">{t("account.bookNew")}</Link>
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <MyBookingsCalendar bookings={bookings ?? []} />
      )}
    </div>
  )
}
