import { parseISO } from "date-fns"
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

import type { CustomerBookingView } from "@/features/my-bookings/api/customerBookingsApi"
import { useCancelCustomerBooking } from "@/features/my-bookings/hooks/useCancelCustomerBooking"
import { useFormatters } from "@/lib/datetime"

const statusVariant = {
  confirmed: "secondary",
  pending: "outline",
  cancelled: "destructive",
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

  if (!booking) return null

  const dateLabel = formatDate(parseISO(booking.startsAt.slice(0, 10)), {
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
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" asChild>
              <Link to={`/${booking.businessSlug}`}>{t("account.viewBusiness")}</Link>
            </Button>
            {booking.status !== "cancelled" && (
              <AlertDialog>
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
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("booking.keepIt")}</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() =>
                        cancelBooking.mutate(booking.id, { onSuccess: () => onOpenChange(false) })
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
