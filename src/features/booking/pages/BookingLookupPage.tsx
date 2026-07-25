import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarCheck } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { z } from "zod"
import { toast } from "sonner"

import { BackButton } from "@/components/layout/BackButton"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { bookingsApi } from "@/features/booking/api/bookingsApi"
import { formatTimeLabel } from "@/features/booking/lib/slotUtils"
import { businesses, services, staff } from "@/fixtures"
import type { Booking } from "@/types"

const lookupSchema = z.object({
  reference: z.string().min(1, "Booking reference is required."),
  phone: z.string().min(6, "Enter the phone number you booked with."),
})

type LookupInput = z.infer<typeof lookupSchema>

const statusVariant = {
  confirmed: "secondary",
  pending: "outline",
  cancelled: "destructive",
} as const

export function BookingLookupPage() {
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
      if (!found) toast.error("No booking found with that reference and phone number.")
    } finally {
      setIsSearching(false)
    }
  }

  async function handleCancel() {
    if (!submitted) return
    await bookingsApi.cancelByReference(submitted.reference, submitted.phone)
    const refreshed = await bookingsApi.lookupByReference(submitted.reference, submitted.phone)
    setBooking(refreshed ?? null)
    toast.success("Booking cancelled.")
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
            <span className="truncate">fast-appointment</span>
          </Link>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-8 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Find my booking</CardTitle>
            <CardDescription>
              Enter the reference from your confirmation and the phone number you booked with.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field data-invalid={!!errors.reference}>
                  <FieldLabel htmlFor="lookup-reference">Booking reference</FieldLabel>
                  <Input id="lookup-reference" placeholder="FA-XXXXXX" {...register("reference")} />
                  <FieldError errors={[errors.reference]} />
                </Field>
                <Field data-invalid={!!errors.phone}>
                  <FieldLabel htmlFor="lookup-phone">Phone</FieldLabel>
                  <Input id="lookup-phone" type="tel" {...register("phone")} />
                  <FieldError errors={[errors.phone]} />
                </Field>
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? "Searching..." : "Find booking"}
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
                <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
              </div>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <span>
                  {new Date(booking.startsAt).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </span>
                <span>
                  {formatTimeLabel(booking.startsAt.slice(11, 16))} -{" "}
                  {formatTimeLabel(booking.endsAt.slice(11, 16))}
                </span>
                {staffMember && <span>with {staffMember.name}</span>}
                <span className="font-mono">{booking.reference}</span>
              </div>

              {booking.status !== "cancelled" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Cancel booking</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                      <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep it</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" onClick={handleCancel}>
                        Cancel booking
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
