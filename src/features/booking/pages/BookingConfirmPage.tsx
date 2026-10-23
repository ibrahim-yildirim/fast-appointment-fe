import { zodResolver } from "@hookform/resolvers/zod"
import { addMinutes } from "date-fns"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link, Navigate, useLocation, useParams, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useCreateBooking } from "@/features/booking/hooks/useCreateBooking"
import {
  createGuestBookingSchema,
  type GuestBookingInput,
} from "@/features/booking/schemas/guestBookingSchema"
import { formatDurationLabel } from "@/features/services/lib/durations"
import { useService } from "@/features/services/hooks/useService"
import { useStaffMember } from "@/features/staff-calendar/hooks/useStaffMember"
import { useFormatters } from "@/lib/datetime"
import { useAuthStore } from "@/stores/authStore"

export function BookingConfirmPage() {
  const { t } = useTranslation()
  const { formatTime, formatMoney, formatDate } = useFormatters()
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

  const { data: service, isLoading: serviceLoading } = useService(business, serviceId!)
  const { data: staff, isLoading: staffLoading } = useStaffMember(business, staffId ?? "")
  const createBooking = useCreateBooking(business.id, business.slug)

  const schema = useMemo(() => createGuestBookingSchema(t), [t])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestBookingInput>({
    resolver: zodResolver(schema),
    defaultValues: { guestName: "", guestPhone: "", guestEmail: "" },
  })

  if (!date || !time || !staffId) {
    return <Navigate to={`/${business.slug}/book/${serviceId}`} replace />
  }

  if (serviceLoading || staffLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  if (!service || !staff) {
    return <p className="text-muted-foreground">{t("booking.slotGone")}</p>
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
      <h1 className="sr-only">{t("booking.confirmTitle")}</h1>
      <CardHeader>
        <CardTitle>{t("booking.confirmTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{service.name}</span>
          <span className="text-muted-foreground">{t("booking.with", { name: staff.name })}</span>
          <span className="text-muted-foreground">
            {formatDate(startsAt, { weekday: "long", month: "long", day: "numeric" })}
          </span>
          <span className="text-muted-foreground">{formatTime(time)}</span>
          <span className="text-muted-foreground">
            {formatDurationLabel(service.durationMinutes, t)} &middot; {formatMoney(service.price)}
          </span>
        </div>

        {isCustomer ? (
          <Button disabled={createBooking.isPending} onClick={() => submitBooking(null)}>
            {createBooking.isPending ? t("booking.confirming") : t("booking.confirm")}
          </Button>
        ) : (
          <>
            <Separator />
            <div>
              <h2 className="text-sm font-medium">{t("booking.yourDetails")}</h2>
              <p className="text-sm text-muted-foreground">{t("booking.yourDetailsHint")}</p>
            </div>

            <form onSubmit={handleSubmit((values) => submitBooking(values))}>
              <FieldGroup>
                <Field data-invalid={!!errors.guestName}>
                  <FieldLabel required htmlFor="guest-name">
                    {t("booking.fullName")}
                  </FieldLabel>
                  <Input id="guest-name" autoComplete="name" {...register("guestName")} />
                  <FieldError errors={[errors.guestName]} />
                </Field>
                <Field data-invalid={!!errors.guestPhone}>
                  <FieldLabel required htmlFor="guest-phone">
                    {t("booking.phone")}
                  </FieldLabel>
                  <Input
                    id="guest-phone"
                    type="tel"
                    autoComplete="tel"
                    {...register("guestPhone")}
                  />
                  <FieldError errors={[errors.guestPhone]} />
                </Field>
                <Field data-invalid={!!errors.guestEmail}>
                  <FieldLabel htmlFor="guest-email">{t("booking.emailOptional")}</FieldLabel>
                  <Input
                    id="guest-email"
                    type="email"
                    autoComplete="email"
                    {...register("guestEmail")}
                  />
                  <FieldError errors={[errors.guestEmail]} />
                </Field>
                <Button type="submit" disabled={createBooking.isPending}>
                  {createBooking.isPending ? t("booking.confirming") : t("booking.confirm")}
                </Button>
              </FieldGroup>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {t("booking.haveAccountPrefix")}{" "}
              <Link
                to="/login"
                state={{ from: location }}
                className="text-foreground underline underline-offset-4"
              >
                {t("auth.logIn")}
              </Link>{" "}
              {t("booking.haveAccountSuffix")}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
