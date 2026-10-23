import { ChevronRightIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Skeleton } from "@/components/ui/skeleton"
import { BookingSteps } from "@/features/booking/components/BookingSteps"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useServices } from "@/features/services/hooks/useServices"
import { formatDurationLabel } from "@/features/services/lib/durations"
import { useFormatters } from "@/lib/datetime"

export function ServiceBrowsePage() {
  const { t } = useTranslation()
  const { formatMoney } = useFormatters()
  const business = useBusinessContext()
  const { data: services, isLoading } = useServices(business)
  const activeServices = services?.filter((service) => service.active)

  return (
    <div className="flex flex-col gap-8">
      <BookingSteps current="service" />
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("booking.chooseService")}
      </h1>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : activeServices && activeServices.length > 0 ? (
        // A salon price board: the row itself is the link, the price is what people scan for.
        <ul className="divide-border border-border divide-y border-y">
          {activeServices.map((service) => (
            <li key={service.id}>
              <Link
                to={`/${business.slug}/book/${service.id}`}
                className="group hover:bg-accent/60 focus-visible:ring-ring -mx-3 flex items-center gap-4 rounded-md px-3 py-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg font-medium">{service.name}</span>
                    <span
                      aria-hidden="true"
                      className="border-muted-foreground/40 mb-1.5 min-w-6 flex-1 border-b border-dotted"
                    />
                    <span className="text-lg font-semibold tabular-nums">
                      {formatMoney(service.price)}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {service.description}
                    {service.description && " · "}
                    <span className="tabular-nums">
                      {formatDurationLabel(service.durationMinutes, t)}
                    </span>
                  </p>
                </div>
                <ChevronRightIcon
                  aria-hidden="true"
                  className="text-muted-foreground group-hover:text-gold size-5 shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="bg-muted/60 text-muted-foreground rounded-lg p-5">
          {t("booking.noServices")}
        </p>
      )}
    </div>
  )
}
