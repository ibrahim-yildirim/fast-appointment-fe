import { CheckIcon, ClockIcon, CopyIcon, PrinterIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"

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
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { BookingSummary } from "@/features/booking/components/BookingSummary"
import { useCancelGuestBooking } from "@/features/booking/hooks/useCancelGuestBooking"
import { useGuestBooking } from "@/features/booking/hooks/useGuestBooking"
import { googleCalendarUrl, type CalendarEvent } from "@/features/booking/lib/calendarExport"
import { forgetGuestBooking, saveGuestBooking } from "@/features/booking/lib/guestBookingStorage"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { businessNow, useFormatters } from "@/lib/datetime"
import { cn } from "@/lib/utils"

/** A guest's own booking, opened through its secret link. The link is the only key. */
export function GuestBookingPage() {
  const { t } = useTranslation()
  const { formatDate, formatTime, formatMoney } = useFormatters()
  const business = useBusinessContext()
  const { uid } = useParams<{ uid: string }>()
  const { data: booking, isLoading } = useGuestBooking(uid!)
  const cancelBooking = useCancelGuestBooking(uid!)
  const [cancelReason, setCancelReason] = useState("")

  // Opening the link on another phone also remembers it there.
  useEffect(() => {
    if (booking) saveGuestBooking(uid!)
    if (booking === null) forgetGuestBooking(uid!)
  }, [booking, uid])

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  if (!booking) {
    return <p className="text-muted-foreground">{t("booking.notFound")}</p>
  }

  const cancelled = booking.status === "cancelled"
  const isUpcoming = new Date(booking.startsAt) > businessNow()
  const StatusIcon = cancelled ? XIcon : booking.status === "pending" ? ClockIcon : CheckIcon

  const location = [booking.businessName, business.address].filter(Boolean).join(", ")
  const calendarEvent: CalendarEvent = {
    title: `${booking.serviceName} · ${booking.businessName}`,
    details: t("booking.with", { name: booking.staffName }),
    location,
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success(t("booking.linkCopied"))
    } catch {
      toast.error(t("errors.generic"))
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-8">
      <div className="flex flex-col items-start gap-4">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-12 items-center justify-center rounded-full",
            booking.status === "confirmed"
              ? "bg-gold text-gold-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          <StatusIcon className="size-6" strokeWidth={2.5} />
        </span>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {t(`booking.statusTitle.${booking.status}`)}
        </h1>
        {cancelled && booking.cancellationReason && (
          <p className="text-muted-foreground text-sm">
            {t("booking.cancelReasonShown", { reason: booking.cancellationReason })}
          </p>
        )}
      </div>

      <BookingSummary
        rows={[
          { label: t("booking.summary.service"), value: booking.serviceName },
          { label: t("booking.summary.staff"), value: booking.staffName },
          {
            label: t("booking.summary.date"),
            value: formatDate(booking.startsAt, { weekday: "long", month: "long", day: "numeric" }),
          },
          {
            label: t("booking.summary.time"),
            value: formatTime(booking.startsAt.slice(11, 16)),
            emphasis: true,
          },
          { label: t("booking.summary.price"), value: formatMoney(booking.price), emphasis: true },
          {
            label: t("booking.summary.place"),
            value: (
              <>
                {booking.businessName}
                {business.address && (
                  <span className="text-muted-foreground block font-normal">
                    {business.address}
                  </span>
                )}
              </>
            ),
          },
        ]}
      />

      <div className="bg-muted/60 flex flex-col gap-3 rounded-lg p-4 print:hidden">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t("booking.keepLinkTitle")}</span>
          <span className="text-muted-foreground text-sm">{t("booking.keepLinkBody")}</span>
        </div>
        <Button variant="outline" className="w-fit" onClick={copyLink}>
          <CopyIcon aria-hidden="true" />
          {t("booking.copyLink")}
        </Button>
      </div>

      {!cancelled && (
        <div className="flex flex-col gap-3 print:hidden">
          <h2 className="text-muted-foreground text-sm font-medium">
            {t("booking.addToCalendar")}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <a href={googleCalendarUrl(calendarEvent)} target="_blank" rel="noreferrer">
                Google Calendar
              </a>
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap print:hidden">
        {booking.status === "confirmed" && isUpcoming && (
          <AlertDialog onOpenChange={(isOpen) => isOpen && setCancelReason("")}>
            <AlertDialogTrigger asChild>
              <Button size="xl" variant="destructive" disabled={cancelBooking.isPending}>
                {t("booking.cancelBooking")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("booking.cancelConfirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription>{t("booking.cancelConfirmBody")}</AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="guest-cancel-reason">{t("booking.cancelReasonLabel")}</Label>
                <Textarea
                  id="guest-cancel-reason"
                  maxLength={500}
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("booking.keepIt")}</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => cancelBooking.mutate(cancelReason.trim() || null)}
                >
                  {t("booking.cancelBooking")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Button size="xl" variant="outline" onClick={() => window.print()}>
          <PrinterIcon aria-hidden="true" />
          {t("booking.print")}
        </Button>
        <Button size="xl" variant="outline" asChild>
          <Link to={`/${business.slug}/book`}>{t("booking.bookAnother")}</Link>
        </Button>
      </div>
    </div>
  )
}
