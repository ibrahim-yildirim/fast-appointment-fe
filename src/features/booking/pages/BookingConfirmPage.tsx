import { addMinutes } from "date-fns"
import { Navigate, useParams, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useCreateBooking } from "@/features/booking/hooks/useCreateBooking"
import { formatTimeLabel } from "@/features/booking/lib/slotUtils"
import { useService } from "@/features/services/hooks/useService"
import { useStaffMember } from "@/features/staff-calendar/hooks/useStaffMember"
import { useAuthStore } from "@/stores/authStore"

export function BookingConfirmPage() {
  const business = useBusinessContext()
  const { serviceId } = useParams<{ serviceId: string }>()
  const [searchParams] = useSearchParams()
  const date = searchParams.get("date")
  const time = searchParams.get("time")
  const staffId = searchParams.get("staffId")
  const actorId = useAuthStore((state) => state.actorId)

  const { data: service, isLoading: serviceLoading } = useService(business.id, serviceId!)
  const { data: staff, isLoading: staffLoading } = useStaffMember(business.id, staffId ?? "")
  const createBooking = useCreateBooking(business.id, business.slug)

  if (!date || !time || !staffId) {
    return <Navigate to={`/${business.slug}/book/${serviceId}`} replace />
  }

  if (serviceLoading || staffLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  if (!service || !staff) {
    return <p className="text-muted-foreground">This slot is no longer available.</p>
  }

  const startsAt = new Date(`${date}T${time}:00.000Z`)
  const endsAt = addMinutes(startsAt, service.durationMinutes)

  return (
    <Card className="max-w-md">
      <h1 className="sr-only">Confirm booking</h1>
      <CardHeader>
        <CardTitle>Confirm booking</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{service.name}</span>
          <span className="text-muted-foreground">with {staff.name}</span>
          <span className="text-muted-foreground">
            {startsAt.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}
          </span>
          <span className="text-muted-foreground">{formatTimeLabel(time)}</span>
          <span className="text-muted-foreground">
            {service.durationMinutes} min &middot; ${service.price.toFixed(2)}
          </span>
        </div>
        <Button
          disabled={createBooking.isPending}
          onClick={() =>
            createBooking.mutate({
              serviceId: service.id,
              staffId: staff.id,
              customerId: actorId!,
              startsAt: startsAt.toISOString(),
              endsAt: endsAt.toISOString(),
              notes: "",
            })
          }
        >
          {createBooking.isPending ? "Booking..." : "Confirm booking"}
        </Button>
      </CardContent>
    </Card>
  )
}
