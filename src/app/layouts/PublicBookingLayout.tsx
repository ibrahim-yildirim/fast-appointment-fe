import { useTranslation } from "react-i18next"
import { Link, Outlet } from "react-router-dom"

import { BackButton } from "@/components/layout/BackButton"
import { LanguageToggle } from "@/components/layout/LanguageToggle"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { weekdayForDate } from "@/features/booking/lib/slotUtils"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { businessToday, useFormatters } from "@/lib/datetime"

export function PublicBookingLayout() {
  const { t } = useTranslation()
  const { formatTime } = useFormatters()
  const business = useBusinessContext()

  const todayHours = business.defaultHours.find(
    (hours) => hours.day === weekdayForDate(businessToday()),
  )
  const todayLabel = todayHours?.enabled
    ? t("booking.todayHours", {
        start: formatTime(todayHours.start),
        end: formatTime(todayHours.end),
      })
    : t("booking.closedToday")

  return (
    <div className="min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <BackButton />
            <Link to={`/${business.slug}`} className="flex min-w-0 items-center gap-3 rounded-md">
              <span
                aria-hidden="true"
                className="bg-primary font-heading text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-md text-lg font-semibold"
              >
                {business.name.charAt(0).toLocaleUpperCase("tr")}
              </span>
              <span className="min-w-0">
                <span className="font-heading block truncate text-lg leading-tight font-semibold">
                  {business.name}
                </span>
                <span className="text-muted-foreground block truncate text-sm">
                  {todayLabel} &middot; {business.address}
                </span>
              </span>
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
