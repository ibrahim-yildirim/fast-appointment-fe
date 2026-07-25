import { CheckCircle2 } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBooking } from "@/features/booking/hooks/useBooking"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useService } from "@/features/services/hooks/useService"
import { useStaffMember } from "@/features/staff-calendar/hooks/useStaffMember"

export function BookingConfirmationPage() {
  const business = useBusinessContext()
  const { bookingId } = useParams<{ bookingId: string }>()
  const { data: booking, isLoading } = useBooking(business.id, bookingId!)
  const { data: service } = useService(business.id, booking?.serviceId ?? "")
  const { data: staff } = useStaffMember(business.id, booking?.staffId ?? "")

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  if (!booking) {
    return <p className="text-muted-foreground">Booking not found.</p>
  }

  const startsAt = new Date(booking.startsAt)

  return (
    <Card className="max-w-md">
      <h1 className="sr-only">Booking confirmed</h1>
      <CardHeader className="items-center text-center">
        <CheckCircle2 aria-hidden="true" className="h-10 w-10 text-primary" />
        <CardTitle>Booking confirmed</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 text-center text-sm">
          <span className="font-medium">{service?.name}</span>
          {staff && <span className="text-muted-foreground">with {staff.name}</span>}
          <span className="text-muted-foreground">
            {startsAt.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}{" "}
            at{" "}
            {startsAt.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
              timeZone: "UTC",
            })}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/30 p-4 text-center">
          <span className="text-xs text-muted-foreground uppercase">Booking reference</span>
          <span className="font-mono text-lg font-semibold tracking-wider">
            {booking.reference}
          </span>
          {booking.customerId === null && (
            <p className="mt-1 text-xs text-muted-foreground">
              Save this code — you'll need it with your phone number to view or cancel this
              booking.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {booking.customerId === null ? (
            <Button asChild>
              <Link to="/booking-lookup">Find my booking</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/account/bookings">View my bookings</Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to={`/${business.slug}/book`}>Book another service</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
