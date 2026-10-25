import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarCheck } from "lucide-react"
import { useState } from "react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import type { TFunction } from "i18next"
import { z } from "zod"
import { toast } from "sonner"

import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge"
import { BackButton } from "@/components/layout/BackButton"
import { LanguageToggle } from "@/components/layout/LanguageToggle"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { bookingsApi } from "@/features/booking/api/bookingsApi"

import { businesses, services, staff } from "@/fixtures"
import type { Booking } from "@/types"
import { useFormatters } from "@/lib/datetime"

function createLookupSchema(t: TFunction) {
  return z.object({
    reference: z.string().min(1, t("validation.referenceRequired")),
    phone: z.string().min(6, t("validation.lookupPhone")),
  })
}

type LookupInput = z.infer<ReturnType<typeof createLookupSchema>>

export function BookingLookupPage() {
  const { t } = useTranslation()
  const { formatTime, formatDate } = useFormatters()
  const lookupSchema = useMemo(() => createLookupSchema(t), [t])

  const [booking, setBooking] = useState<Booking | null>(null)
  const [submitted, setSubmitted] = useState<LookupInput | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LookupInput>({
    resolver: zodResolver(lookupSchema),
    defaultValues: { reference: "", phone: "" },
  })

  async function onSubmit(values: LookupInput) {
    setIsSearching(true)
    try {
      const found = await bookingsApi.lookupByReference(values.reference, values.phone)
      setBooking(found ?? null)
      setSubmitted(values)
      if (!found) toast.error(t("booking.notFoundToast"))
    } finally {
      setIsSearching(false)
    }
  }

  async function handleCancel() {
    if (!submitted) return
    await bookingsApi.cancelByReference(submitted.reference, submitted.phone)
    const refreshed = await bookingsApi.lookupByReference(submitted.reference, submitted.phone)
    setBooking(refreshed ?? null)
    toast.success(t("booking.cancelledToast"))
  }

  const business = booking ? businesses.find((item) => item.id === booking.businessId) : undefined
  const service = booking ? services.find((item) => item.id === booking.serviceId) : undefined
  const staffMember = booking ? staff.find((item) => item.id === booking.staffId) : undefined

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <BackButton />
          <Link to="/" className="flex min-w-0 items-center gap-2 font-semibold">
            <CalendarCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
            <span className="truncate">{t("common.appName")}</span>
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-8 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("booking.findMyBooking")}</CardTitle>
            <CardDescription>{t("booking.lookupSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field data-invalid={!!errors.reference}>
                  <FieldLabel required htmlFor="lookup-reference">
                    {t("booking.reference")}
                  </FieldLabel>
                  <Input id="lookup-reference" placeholder="FA-XXXXXX" {...register("reference")} />
                  <FieldError errors={[errors.reference]} />
                </Field>
                <Field data-invalid={!!errors.phone}>
                  <FieldLabel required htmlFor="lookup-phone">
                    {t("booking.phone")}
                  </FieldLabel>
                  <Input id="lookup-phone" type="tel" {...register("phone")} />
                  <FieldError errors={[errors.phone]} />
                </Field>
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? t("booking.searching") : t("booking.findBooking")}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        {booking && service && (
          <Card>
            <CardHeader>
              <CardTitle>{service.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{business?.name}</span>
                <BookingStatusBadge status={booking.status} />
              </div>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <span>
                  {formatDate(booking.startsAt, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span>
                  {formatTime(booking.startsAt.slice(11, 16))} -{" "}
                  {formatTime(booking.endsAt.slice(11, 16))}
                </span>
                {staffMember && <span>{t("booking.with", { name: staffMember.name })}</span>}
                <span className="font-mono">{booking.reference}</span>
              </div>

              {booking.status !== "cancelled" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">{t("booking.cancelBooking")}</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("booking.cancelConfirmTitle")}</AlertDialogTitle>
                      <AlertDialogDescription>{t("booking.cancelConfirmBody")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("booking.keepIt")}</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" onClick={handleCancel}>
                        {t("booking.cancelBooking")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
