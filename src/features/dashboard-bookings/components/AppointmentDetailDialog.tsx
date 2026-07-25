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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatTimeLabel } from "@/features/booking/lib/slotUtils"
import type { CalendarAppointment } from "@/features/dashboard-bookings/hooks/useCalendarAppointments"
import type { Staff } from "@/types"

const statusVariant = {
  confirmed: "secondary",
  pending: "outline",
  cancelled: "destructive",
} as const

export function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
  eligibleStaff,
  onReassign,
  onCancel,
  isSaving,
}: {
  appointment: CalendarAppointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  eligibleStaff: Staff[]
  onReassign: (staffId: string) => void
  onCancel: () => void
  isSaving: boolean
}) {
  if (!appointment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{appointment.serviceName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{appointment.customerName}</span>
            <Badge variant={statusVariant[appointment.status]}>{appointment.status}</Badge>
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span>{appointment.dateKey}</span>
            <span>
              {formatTimeLabel(appointment.startTime)} - {formatTimeLabel(appointment.endTime)}
            </span>
            <span>
              {appointment.durationMinutes} min &middot; ${appointment.price.toFixed(2)}
            </span>
            {appointment.notes && <span>Notes: {appointment.notes}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Staff</span>
            <Select
              value={appointment.staffId}
              disabled={appointment.status === "cancelled" || isSaving}
              onValueChange={onReassign}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eligibleStaff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {appointment.status !== "cancelled" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isSaving}>
                  Cancel appointment
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {appointment.customerName} will need to be notified separately.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={onCancel}>
                    Cancel appointment
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
