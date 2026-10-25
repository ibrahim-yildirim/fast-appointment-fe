import { addMinutes } from "date-fns"
import { useTranslation } from "react-i18next"
import { Link, Navigate, useLocation, useParams, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { BookingSteps } from "@/features/booking/components/BookingSteps"
import { BookingSummary } from "@/features/booking/components/BookingSummary"
import { GuestBookingForm } from "@/features/booking/components/GuestBookingForm"
import { useCreateBooking } from "@/features/booking/hooks/useCreateBooking"
import { useCreateGuestBooking } from "@/features/booking/hooks/useCreateGuestBooking"
import type { GuestBookingInput } from "@/features/booking/schemas/guestBookingSchema"
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
  const createGuestBooking = useCreateGuestBooking(business)

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

  function submitBooking() {
    createBooking.mutate({
      serviceId: service!.id,
      staffId: staff!.id,
      customerId: actorId,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      notes: "",
    })
  }

  function submitGuestBooking(values: GuestBookingInput) {
    createGuestBooking.mutate({
      serviceId: service!.id,
      staffId: staff!.id,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      name: values.guestName,
      phone: values.guestPhone,
      email: values.guestEmail,
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <BookingSteps current="confirm" />
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("booking.confirmTitle")}
      </h1>

      <div className="flex max-w-md flex-col gap-6">
        <BookingSummary
          rows={[
            { label: t("booking.summary.service"), value: service.name },
            { label: t("booking.summary.staff"), value: staff.name },
            {
              label: t("booking.summary.date"),
              value: formatDate(startsAt, { weekday: "long", month: "long", day: "numeric" }),
            },
            { label: t("booking.summary.time"), value: formatTime(time), emphasis: true },
            {
              label: t("booking.summary.duration"),
              value: formatDurationLabel(service.durationMinutes, t),
            },
            {
              label: t("booking.summary.price"),
              value: formatMoney(service.price),
              emphasis: true,
            },
          ]}
        />

        {isCustomer ? (
          <Button size="xl" disabled={createBooking.isPending} onClick={submitBooking}>
            {createBooking.isPending ? t("booking.confirming") : t("booking.confirm")}
          </Button>
        ) : (
          <>
            <GuestBookingForm
              isPending={createGuestBooking.isPending}
              onSubmit={submitGuestBooking}
            />
            <div className="bg-muted/60 flex flex-col gap-3 rounded-lg p-5">
              <p className="text-sm">
                <span className="font-medium">{t("booking.haveAccountPrefix")}</span>{" "}
                <span className="text-muted-foreground">{t("booking.haveAccountSuffix")}</span>
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" asChild>
                  <Link to="/login" state={{ from: location }}>
                    {t("auth.logIn")}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/register" state={{ from: location }}>
                    {t("auth.register")}
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
