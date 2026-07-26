import { zodResolver } from "@hookform/resolvers/zod"
import { addMinutes } from "date-fns"
import { useForm } from "react-hook-form"
import { Link, Navigate, useLocation, useParams, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useCreateBooking } from "@/features/booking/hooks/useCreateBooking"
import { formatTimeLabel } from "@/features/booking/lib/slotUtils"
import {
  guestBookingSchema,
  type GuestBookingInput,
} from "@/features/booking/schemas/guestBookingSchema"
import { useService } from "@/features/services/hooks/useService"
import { useStaffMember } from "@/features/staff-calendar/hooks/useStaffMember"
import { useAuthStore } from "@/stores/authStore"

export function BookingConfirmPage() {
  const business = useBusinessContext()
  const location = useLocation()
  const { serviceId } = useParams<{ serviceId: string }>()
  const [searchParams] = useSearchParams()
  const date = searchParams.get("date")
  const time = searchParams.get("time")
  const staffId = searchParams.get("staffId")

  const actorId = useAuthStore((state) => state.actorId)
  const role = useAuthStore((state) => state.role)
  const isCustomer = Boolean(actorId) && role === "customer"

  const { data: service, isLoading: serviceLoading } = useService(business.id, serviceId!)
  const { data: staff, isLoading: staffLoading } = useStaffMember(business.id, staffId ?? "")
  const createBooking = useCreateBooking(business.id, business.slug)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestBookingInput>({
    resolver: zodResolver(guestBookingSchema),
    defaultValues: { guestName: "", guestPhone: "", guestEmail: "" },
  })

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

  function submitBooking(guest: GuestBookingInput | null) {
    createBooking.mutate({
      serviceId: service!.id,
      staffId: staff!.id,
      customerId: isCustomer ? actorId : null,
      guestName: guest?.guestName ?? null,
      guestPhone: guest?.guestPhone ?? null,
      guestEmail: guest?.guestEmail ? guest.guestEmail : null,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      notes: "",
    })
  }

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

        {isCustomer ? (
          <Button disabled={createBooking.isPending} onClick={() => submitBooking(null)}>
            {createBooking.isPending ? "Booking..." : "Confirm booking"}
          </Button>
        ) : (
          <>
            <Separator />
            <div>
              <h2 className="text-sm font-medium">Your details</h2>
              <p className="text-sm text-muted-foreground">
                No account needed — we'll use these to confirm your appointment.
              </p>
            </div>

            <form onSubmit={handleSubmit((values) => submitBooking(values))}>
              <FieldGroup>
                <Field data-invalid={!!errors.guestName}>
                  <FieldLabel required htmlFor="guest-name">Full name</FieldLabel>
                  <Input id="guest-name" autoComplete="name" {...register("guestName")} />
                  <FieldError errors={[errors.guestName]} />
                </Field>
                <Field data-invalid={!!errors.guestPhone}>
                  <FieldLabel required htmlFor="guest-phone">Phone</FieldLabel>
                  <Input
                    id="guest-phone"
                    type="tel"
                    autoComplete="tel"
                    {...register("guestPhone")}
                  />
                  <FieldError errors={[errors.guestPhone]} />
                </Field>
                <Field data-invalid={!!errors.guestEmail}>
                  <FieldLabel htmlFor="guest-email">Email (optional)</FieldLabel>
                  <Input
                    id="guest-email"
                    type="email"
                    autoComplete="email"
                    {...register("guestEmail")}
                  />
                  <FieldError errors={[errors.guestEmail]} />
                </Field>
                <Button type="submit" disabled={createBooking.isPending}>
                  {createBooking.isPending ? "Booking..." : "Confirm booking"}
                </Button>
              </FieldGroup>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Have an account?{" "}
              <Link
                to="/login"
                state={{ from: location }}
                className="text-foreground underline underline-offset-4"
              >
                Log in
              </Link>{" "}
              to keep all your bookings in one place.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
