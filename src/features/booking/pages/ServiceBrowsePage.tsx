import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useServices } from "@/features/services/hooks/useServices"

export function ServiceBrowsePage() {
  const business = useBusinessContext()
  const { data: services, isLoading } = useServices(business.id)
  const activeServices = services?.filter((service) => service.active)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Book with {business.name}</h1>

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
                  {service.durationMinutes} min &middot; ${service.price.toFixed(2)}
                </span>
                <Button asChild>
                  <Link to={`/${business.slug}/book/${service.id}`}>Book</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
          No services available right now.
        </div>
      )}
    </div>
  )
}
