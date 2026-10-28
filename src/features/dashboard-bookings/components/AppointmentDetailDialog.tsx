import { useState } from "react"
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
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { CalendarAppointment } from "@/features/dashboard-bookings/hooks/useCalendarAppointments"
import type { Staff } from "@/types"
import { businessNow, useFormatters } from "@/lib/datetime"
import { formatPhone, phoneHref } from "@/lib/phone"
import { formatDurationLabel } from "@/features/services/lib/durations"

export function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
  eligibleStaff,
  onReschedule,
  onReassign,
  onCancel,
  onMarkNoShow,
  isSaving,
}: {
  appointment: CalendarAppointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  eligibleStaff: Staff[]
  onReschedule: (dateKey: string, startTime: string) => void
  onReassign: (staffId: string) => void
  onCancel: (reason: string | null) => void
  onMarkNoShow: () => void
  isSaving: boolean
}) {
  const { formatTime, formatMoney, formatDate } = useFormatters()
  const { t } = useTranslation()
  const [cancelReason, setCancelReason] = useState("")
  const [isEditingTime, setIsEditingTime] = useState(false)
  const [newDate, setNewDate] = useState(appointment?.dateKey ?? "")
  const [newTime, setNewTime] = useState(appointment?.startTime ?? "")

  if (!appointment) return null

  const isOpen = appointment.status === "confirmed" || appointment.status === "pending"
  // Wall-clock strings compare directly with businessNow() (see lib/datetime).
  const hasStarted =
    new Date(`${appointment.dateKey}T${appointment.startTime}:00.000Z`) <= businessNow()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{appointment.serviceName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{appointment.customerName}</span>
              {appointment.customerPhone && (
                <a
                  href={phoneHref(appointment.customerPhone)}
                  className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  {formatPhone(appointment.customerPhone)}
                </a>
              )}
            </div>
            <BookingStatusBadge status={appointment.status} />
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span>
              {formatDate(`${appointment.dateKey}T00:00:00.000Z`, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>
              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
            </span>
            <span>
              {formatDurationLabel(appointment.durationMinutes, t)} &middot; {formatMoney(appointment.price)}
            </span>
            {appointment.notes && <span>{t("account.notes", { notes: appointment.notes })}</span>}
            {appointment.cancelledBy && (
              <span>{t(`dashboard.cancelledBy.${appointment.cancelledBy}`)}</span>
            )}
            {appointment.cancellationReason && (
              <span>{t("booking.cancelReasonShown", { reason: appointment.cancellationReason })}</span>
            )}
          </div>

          {isOpen && !isEditingTime && (
            <Button variant="outline" disabled={isSaving} onClick={() => setIsEditingTime(true)}>
              {t("dashboard.reschedule")}
            </Button>
          )}
          {isOpen && isEditingTime && (
            <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
              <span className="text-sm font-medium">{t("dashboard.rescheduleTitle")}</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reschedule-date">{t("dashboard.form.date")}</Label>
                  <Input
                    id="reschedule-date"
                    type="date"
                    value={newDate}
                    onChange={(event) => setNewDate(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reschedule-time">{t("dashboard.form.time")}</Label>
                  <Input
                    id="reschedule-time"
                    type="time"
                    step={300}
                    value={newTime}
                    onChange={(event) => setNewTime(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={isSaving || !newDate || !newTime}
                  onClick={() => {
                    onReschedule(newDate, newTime)
                    setIsEditingTime(false)
                  }}
                >
                  {t("dashboard.saveTime")}
                </Button>
                <Button variant="outline" onClick={() => setIsEditingTime(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t("dashboard.staff")}</span>
            <Select
              value={appointment.staffId}
              disabled={!isOpen || isSaving}
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

          {appointment.status === "confirmed" && hasStarted && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isSaving}>
                  {t("dashboard.markNoShow")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("dashboard.markNoShowTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("dashboard.markNoShowBody", { name: appointment.customerName })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={onMarkNoShow}>
                    {t("dashboard.markNoShow")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {isOpen && (
            <AlertDialog onOpenChange={(isOpen) => isOpen && setCancelReason("")}>
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
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="owner-cancel-reason">{t("booking.cancelReasonLabel")}</Label>
                  <Textarea
                    id="owner-cancel-reason"
                    maxLength={500}
                    value={cancelReason}
                    onChange={(event) => setCancelReason(event.target.value)}
                    placeholder={t("dashboard.cancelReasonPlaceholder")}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("booking.keepIt")}</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => onCancel(cancelReason.trim() || null)}
                  >
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
