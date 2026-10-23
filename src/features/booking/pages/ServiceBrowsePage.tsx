import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useServices } from "@/features/services/hooks/useServices"
import { useFormatters } from "@/lib/datetime"
import { formatDurationLabel } from "@/features/services/lib/durations"

export function ServiceBrowsePage() {
  const { t } = useTranslation()
  const { formatMoney } = useFormatters()
  const business = useBusinessContext()
  const { data: services, isLoading } = useServices(business)
  const activeServices = services?.filter((service) => service.active)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t("booking.bookWith", { name: business.name })}</h1>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : activeServices && activeServices.length > 0 ? (
        <div className="flex flex-col gap-3">
          {activeServices.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  {formatDurationLabel(service.durationMinutes, t)} &middot; {formatMoney(service.price)}
                </span>
                <Button asChild>
                  <Link to={`/${business.slug}/book/${service.id}`}>{t("booking.book")}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
          {t("booking.noServices")}
        </div>
      )}
    </div>
  )
}
