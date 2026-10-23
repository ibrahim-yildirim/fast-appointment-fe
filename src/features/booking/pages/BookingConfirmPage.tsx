import { addMinutes } from "date-fns"
import { useTranslation } from "react-i18next"
import { Link, Navigate, useLocation, useParams, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useCreateBooking } from "@/features/booking/hooks/useCreateBooking"
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
      guestName: null,
      guestPhone: null,
      guestEmail: null,
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
          <Button disabled={createBooking.isPending} onClick={submitBooking}>
            {createBooking.isPending ? t("booking.confirming") : t("booking.confirm")}
          </Button>
        ) : (
          <>
            <Separator />
            {/* Guest booking is postponed until phone verification exists, so booking needs an account. */}
            <p className="text-sm text-muted-foreground">{t("booking.loginRequiredHint")}</p>
            <div className="flex flex-col gap-2">
              <Button asChild>
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
