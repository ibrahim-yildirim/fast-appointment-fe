import { useQueries } from "@tanstack/react-query"
import { CalendarCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { queryKeys } from "@/api/queryKeys"
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge"
import { BackButton } from "@/components/layout/BackButton"
import { LanguageToggle } from "@/components/layout/LanguageToggle"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Skeleton } from "@/components/ui/skeleton"
import { guestBookingsApi } from "@/features/booking/api/guestBookingsApi"
import {
  forgetGuestBooking,
  getSavedGuestBookings,
} from "@/features/booking/lib/guestBookingStorage"
import { useFormatters } from "@/lib/datetime"

/** Guest bookings remembered on this device (no account, so nothing to log in to). */
export function GuestBookingsPage() {
  const { t } = useTranslation()
  const { formatDate, formatTime } = useFormatters()
  const [uids] = useState(getSavedGuestBookings)

  const results = useQueries({
    queries: uids.map((uid) => ({
      queryKey: queryKeys.guestBookings.byUid(uid),
      queryFn: () => guestBookingsApi.byUid(uid),
    })),
  })

  // Links whose booking is gone are dropped from this device.
  useEffect(() => {
    results.forEach((result, index) => {
      if (result.data === null) forgetGuestBooking(uids[index])
    })
  }, [results, uids])

  const isLoading = results.some((result) => result.isLoading)
  const bookings = results
    .map((result) => result.data)
    .filter((booking) => booking != null)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))

  return (
    <>
      <header className="border-border flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2 font-semibold">
          <CalendarCheck aria-hidden="true" className="text-primary h-5 w-5 shrink-0" />
          <span className="truncate">{t("common.appName")}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10 sm:px-6">
        <BackButton />
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t("booking.deviceBookingsTitle")}
          </h1>
          <p className="text-muted-foreground text-sm">{t("booking.deviceBookingsHint")}</p>
        </div>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : bookings.length === 0 ? (
          <p className="text-muted-foreground">{t("booking.deviceBookingsEmpty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {bookings.map((booking) => (
              <li key={booking.uid}>
                <Link
                  to={`/${booking.businessSlug}/booking/${booking.uid}`}
                  className="hover:bg-muted/50 border-border flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-medium">{booking.serviceName}</span>
                    <span className="text-muted-foreground truncate text-sm">
                      {booking.businessName} ·{" "}
                      {formatDate(booking.startsAt, { day: "numeric", month: "long" })}{" "}
                      {formatTime(booking.startsAt.slice(11, 16))}
                    </span>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
