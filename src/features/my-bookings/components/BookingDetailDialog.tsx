import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { CustomerBookingView } from "@/features/my-bookings/api/customerBookingsApi"
import { useCancelCustomerBooking } from "@/features/my-bookings/hooks/useCancelCustomerBooking"
import { useFormatters } from "@/lib/datetime"

const statusVariant = {
  confirmed: "secondary",
  pending: "outline",
  cancelled: "destructive",
  no_show: "outline",
} as const

export function BookingDetailDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: CustomerBookingView | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const { formatTime, formatMoney, formatDate } = useFormatters()

  const cancelBooking = useCancelCustomerBooking()
  const [cancelReason, setCancelReason] = useState("")

  if (!booking) return null

  const dateLabel = formatDate(booking.startsAt, {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{booking.serviceName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{booking.businessName}</span>
            <Badge variant={statusVariant[booking.status]}>{t(`booking.status.${booking.status}`)}</Badge>
          </div>

          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span>{dateLabel}</span>
            <span>
              {formatTime(booking.startsAt.slice(11, 16))} -{" "}
              {formatTime(booking.endsAt.slice(11, 16))}
            </span>
            <span>{t("booking.with", { name: booking.staffName })}</span>
            <span>{formatMoney(booking.price)}</span>
            {booking.notes && <span>{t("account.notes", { notes: booking.notes })}</span>}
            {booking.cancelledBy && <span>{t(`account.cancelledBy.${booking.cancelledBy}`)}</span>}
            {booking.cancellationReason && (
              <span>{t("booking.cancelReasonShown", { reason: booking.cancellationReason })}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" asChild>
              <Link to={`/${booking.businessSlug}`}>{t("account.viewBusiness")}</Link>
            </Button>
            {booking.status !== "cancelled" && (
              <AlertDialog onOpenChange={(isOpen) => isOpen && setCancelReason("")}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={cancelBooking.isPending}>
                    {t("booking.cancelBooking")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("booking.cancelConfirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>{t("booking.cancelConfirmBody")}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="customer-cancel-reason">{t("booking.cancelReasonLabel")}</Label>
                    <Textarea
                      id="customer-cancel-reason"
                      maxLength={500}
                      value={cancelReason}
                      onChange={(event) => setCancelReason(event.target.value)}
                      placeholder={t("account.cancelReasonPlaceholder")}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("booking.keepIt")}</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() =>
                        cancelBooking.mutate(
                          { bookingId: booking.id, reason: cancelReason.trim() || null },
                          { onSuccess: () => onOpenChange(false) },
                        )
                      }
                    >
                      {t("booking.cancelBooking")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
