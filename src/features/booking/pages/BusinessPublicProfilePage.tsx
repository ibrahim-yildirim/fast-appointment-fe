import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { weekdayForDate } from "@/features/booking/lib/slotUtils"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { weekdayOrder } from "@/lib/constants"
import { businessToday, useFormatters } from "@/lib/datetime"
import { cn } from "@/lib/utils"

export function BusinessPublicProfilePage() {
  const { t } = useTranslation()
  const { formatTime } = useFormatters()
  const business = useBusinessContext()
  const today = weekdayForDate(businessToday())

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-start gap-4">
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          {business.name}
        </h1>
        <p className="text-muted-foreground max-w-prose text-lg">{business.description}</p>
        <Button asChild size="xl" className="mt-2">
          <Link to={`/${business.slug}/book`}>{t("booking.bookNow")}</Link>
        </Button>
      </section>

      <div className="border-border grid gap-10 border-t pt-8 sm:grid-cols-2">
        <section>
          <h2 className="font-heading text-xl font-semibold">{t("booking.contact")}</h2>
          <dl className="mt-4 flex flex-col gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">{t("booking.address")}</dt>
              <dd className="mt-0.5">{business.address}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("booking.phone")}</dt>
              <dd className="mt-0.5 tabular-nums">
                <a
                  href={`tel:${business.phone.replace(/\s/g, "")}`}
                  className="hover:text-gold underline-offset-4 hover:underline"
                >
                  {business.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("booking.email")}</dt>
              <dd className="mt-0.5">
                <a
                  href={`mailto:${business.email}`}
                  className="hover:text-gold underline-offset-4 hover:underline"
                >
                  {business.email}
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold">{t("booking.openingHours")}</h2>
          <dl className="mt-4 text-sm">
            {weekdayOrder.map((day) => {
              const hours = business.defaultHours.find((entry) => entry.day === day)
              const isToday = day === today

              return (
                <div
                  key={day}
                  className={cn(
                    "border-border flex items-center justify-between gap-4 border-b py-2 last:border-b-0",
                    isToday && "font-medium",
                  )}
                >
                  <dt className="flex items-center gap-2">
                    {t(`weekday.${day}`)}
                    {isToday && (
                      <span aria-hidden="true" className="bg-gold size-1.5 rounded-full" />
                    )}
                  </dt>
                  <dd className={cn("tabular-nums", !hours?.enabled && "text-muted-foreground")}>
                    {hours?.enabled
                      ? `${formatTime(hours.start)}–${formatTime(hours.end)}`
                      : t("booking.closed")}
                  </dd>
                </div>
              )
            })}
          </dl>
        </section>
      </div>
    </div>
  )
}
