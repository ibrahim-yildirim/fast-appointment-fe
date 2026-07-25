import { parseISO } from "date-fns"
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
import { formatTimeLabel } from "@/features/booking/lib/slotUtils"
import type { CustomerBookingView } from "@/features/my-bookings/api/customerBookingsApi"
import { useCancelCustomerBooking } from "@/features/my-bookings/hooks/useCancelCustomerBooking"

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
  const cancelBooking = useCancelCustomerBooking()

  if (!booking) return null

  const dateLabel = parseISO(booking.startsAt.slice(0, 10)).toLocaleDateString(undefined, {
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
            <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
          </div>

          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span>{dateLabel}</span>
            <span>
              {formatTimeLabel(booking.startsAt.slice(11, 16))} -{" "}
              {formatTimeLabel(booking.endsAt.slice(11, 16))}
            </span>
            <span>with {booking.staffName}</span>
            <span>${booking.price.toFixed(2)}</span>
            {booking.notes && <span>Notes: {booking.notes}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" asChild>
              <Link to={`/${booking.businessSlug}`}>View business</Link>
            </Button>
            {booking.status !== "cancelled" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={cancelBooking.isPending}>
                    Cancel booking
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                    <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep it</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() =>
                        cancelBooking.mutate(booking.id, { onSuccess: () => onOpenChange(false) })
                      }
                    >
                      Cancel booking
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
