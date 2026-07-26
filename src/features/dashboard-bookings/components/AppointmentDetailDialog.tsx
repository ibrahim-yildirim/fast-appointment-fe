import { useTranslation } from "react-i18next"
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

import type { CalendarAppointment } from "@/features/dashboard-bookings/hooks/useCalendarAppointments"
import type { Staff } from "@/types"
import { useFormatters } from "@/lib/datetime"
import { formatDurationLabel } from "@/features/services/lib/durations"

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
  const { formatTime, formatMoney } = useFormatters()
  const { t } = useTranslation()

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
            <Badge variant={statusVariant[appointment.status]}>
              {t(`booking.status.${appointment.status}`)}
            </Badge>
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span>{appointment.dateKey}</span>
            <span>
              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
            </span>
            <span>
              {formatDurationLabel(appointment.durationMinutes, t)} &middot; {formatMoney(appointment.price)}
            </span>
            {appointment.notes && <span>{t("account.notes", { notes: appointment.notes })}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t("dashboard.staff")}</span>
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
                  {t("dashboard.cancelAppointment")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("dashboard.cancelAppointmentTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("dashboard.cancelAppointmentBody", { name: appointment.customerName })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("booking.keepIt")}</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={onCancel}>
                    {t("dashboard.cancelAppointment")}
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
