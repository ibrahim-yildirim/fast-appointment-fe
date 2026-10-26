import { Plus } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useUpdateBooking } from "@/features/booking/hooks/useUpdateBooking"
import { minutesToTimeString, timeStringToMinutes } from "@/features/booking/lib/slotUtils"
import { AppointmentDetailDialog } from "@/features/dashboard-bookings/components/AppointmentDetailDialog"
import { CalendarToolbar } from "@/features/dashboard-bookings/components/CalendarToolbar"
import { ListView } from "@/features/dashboard-bookings/components/ListView"
import { MonthView } from "@/features/dashboard-bookings/components/MonthView"
import { NewBookingDialog } from "@/features/dashboard-bookings/components/NewBookingDialog"
import { WeekDayGrid } from "@/features/dashboard-bookings/components/WeekDayGrid"
import {
  defaultCalendarFilters,
  useCalendarAppointments,
  type CalendarFilters,
} from "@/features/dashboard-bookings/hooks/useCalendarAppointments"
import { getWeekDays, navigateDate, type CalendarView } from "@/lib/calendarUtils"
import { businessToday } from "@/lib/datetime"
import { useOwnerServices } from "@/features/services/hooks/useOwnerServices"
import { useOwnerStaff } from "@/features/staff-calendar/hooks/useOwnerStaff"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardBookingsPage() {
  const { t } = useTranslation()
  const business = useBusinessContext()
  // Bumped on every open so the dialog mounts with a fresh form.
  const [newBookingKey, setNewBookingKey] = useState(0)
  const [newBookingOpen, setNewBookingOpen] = useState(false)
  const [view, setView] = useState<CalendarView>("month")
  const [referenceDate, setReferenceDate] = useState(() => businessToday())
  const [filters, setFilters] = useState<CalendarFilters>(defaultCalendarFilters)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)

  const { data: services } = useOwnerServices(business.id)
  const { data: staff } = useOwnerStaff(business.id)
  const { appointments, isLoading } = useCalendarAppointments(business, filters)
  const updateBooking = useUpdateBooking(business.id)

  // Keeps the booking's length; the backend rechecks opening hours and overlaps.
  function moveBooking(id: string, dateKey: string, startTime: string) {
    const appointment = appointments.find((candidate) => candidate.id === id)
    if (!appointment) return

    const durationMinutes =
      timeStringToMinutes(appointment.endTime) - timeStringToMinutes(appointment.startTime)
    const endTime = minutesToTimeString(timeStringToMinutes(startTime) + durationMinutes)

    updateBooking.mutate({
      bookingId: id,
      patch: {
        startsAt: `${dateKey}T${startTime}:00.000Z`,
        endsAt: `${dateKey}T${endTime}:00.000Z`,
      },
    })
  }

  function handleReschedule(id: string, dateKey: string, hour?: number) {
    const appointment = appointments.find((candidate) => candidate.id === id)
    if (!appointment) return
    moveBooking(id, dateKey, hour !== undefined ? minutesToTimeString(hour * 60) : appointment.startTime)
  }

  const dialogOpen = selectedAppointmentId !== null || newBookingOpen
  const selectedAppointment =
    appointments.find((appointment) => appointment.id === selectedAppointmentId) ?? null
  const eligibleStaff = selectedAppointment
    ? (staff ?? []).filter(
        (member) =>
          member.active &&
          services
            ?.find((service) => service.id === selectedAppointment.serviceId)
            ?.eligibleStaffIds.includes(member.id),
      )
    : []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setNewBookingKey((key) => key + 1)
            setNewBookingOpen(true)
          }}
        >
          <Plus data-icon="inline-start" />
          {t("dashboard.newBooking")}
        </Button>
      </div>

      <CalendarToolbar
        view={view}
        onViewChange={setView}
        referenceDate={referenceDate}
        onNavigate={(direction) => setReferenceDate((current) => navigateDate(current, view, direction))}
        onToday={() => setReferenceDate(businessToday())}
        filters={filters}
        onFiltersChange={setFilters}
        services={services ?? []}
        staff={staff ?? []}
      />

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          {view === "month" && (
            <MonthView
              referenceDate={referenceDate}
              appointments={appointments}
              onSelectAppointment={setSelectedAppointmentId}
              onReschedule={handleReschedule}
              previewsDisabled={dialogOpen}
              onShowMore={(date) => {
                setReferenceDate(date)
                setView("day")
              }}
            />
          )}
          {view === "week" && (
            <WeekDayGrid
              days={getWeekDays(referenceDate)}
              appointments={appointments}
              onSelectAppointment={setSelectedAppointmentId}
              onReschedule={handleReschedule}
              previewsDisabled={dialogOpen}
            />
          )}
          {view === "day" && (
            <WeekDayGrid
              days={[referenceDate]}
              appointments={appointments}
              onSelectAppointment={setSelectedAppointmentId}
              onReschedule={handleReschedule}
              previewsDisabled={dialogOpen}
            />
          )}
          {view === "list" && (
            <ListView appointments={appointments} onSelectAppointment={setSelectedAppointmentId} />
          )}
        </>
      )}

      <NewBookingDialog
        key={newBookingKey}
        businessId={business.id}
        open={newBookingOpen}
        onOpenChange={setNewBookingOpen}
        services={services ?? []}
        staff={staff ?? []}
      />

      <AppointmentDetailDialog
        // Remount per booking so the time editor starts from that booking's values.
        key={selectedAppointmentId ?? "none"}
        appointment={selectedAppointment}
        open={selectedAppointmentId !== null}
        onOpenChange={(open) => !open && setSelectedAppointmentId(null)}
        eligibleStaff={eligibleStaff}
        isSaving={updateBooking.isPending}
        onReschedule={(dateKey, startTime) => {
          if (!selectedAppointmentId) return
          moveBooking(selectedAppointmentId, dateKey, startTime)
        }}
        onReassign={(staffId) => {
          if (!selectedAppointmentId) return
          updateBooking.mutate({ bookingId: selectedAppointmentId, patch: { staffId } })
        }}
        onMarkNoShow={() => {
          if (!selectedAppointmentId) return
          updateBooking.mutate({ bookingId: selectedAppointmentId, patch: { status: "no_show" } })
        }}
        onCancel={(reason) => {
          if (!selectedAppointmentId) return
          updateBooking.mutate(
            {
              bookingId: selectedAppointmentId,
              patch: { status: "cancelled", cancellationReason: reason },
            },
            { onSuccess: () => setSelectedAppointmentId(null) },
          )
        }}
      />
    </div>
  )
}
