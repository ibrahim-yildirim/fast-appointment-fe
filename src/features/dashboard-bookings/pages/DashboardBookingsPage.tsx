import { useState } from "react"

import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useUpdateBooking } from "@/features/booking/hooks/useUpdateBooking"
import { minutesToTimeString, timeStringToMinutes } from "@/features/booking/lib/slotUtils"
import { AppointmentDetailDialog } from "@/features/dashboard-bookings/components/AppointmentDetailDialog"
import { CalendarToolbar } from "@/features/dashboard-bookings/components/CalendarToolbar"
import { ListView } from "@/features/dashboard-bookings/components/ListView"
import { MonthView } from "@/features/dashboard-bookings/components/MonthView"
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
  const business = useBusinessContext()
  const [view, setView] = useState<CalendarView>("month")
  const [referenceDate, setReferenceDate] = useState(() => businessToday())
  const [filters, setFilters] = useState<CalendarFilters>(defaultCalendarFilters)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)

  const { data: services } = useOwnerServices(business.id)
  const { data: staff } = useOwnerStaff(business.id)
  const { appointments, isLoading } = useCalendarAppointments(business, filters)
  const updateBooking = useUpdateBooking(business.id)

  function handleReschedule(id: string, dateKey: string, hour?: number) {
    const appointment = appointments.find((candidate) => candidate.id === id)
    if (!appointment) return

    const durationMinutes =
      timeStringToMinutes(appointment.endTime) - timeStringToMinutes(appointment.startTime)
    const startMinutes = hour !== undefined ? hour * 60 : timeStringToMinutes(appointment.startTime)
    const startTime = minutesToTimeString(startMinutes)
    const endTime = minutesToTimeString(startMinutes + durationMinutes)

    updateBooking.mutate({
      bookingId: id,
      patch: {
        startsAt: `${dateKey}T${startTime}:00.000Z`,
        endsAt: `${dateKey}T${endTime}:00.000Z`,
      },
    })
  }

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
            />
          )}
          {view === "day" && (
            <WeekDayGrid
              days={[referenceDate]}
              appointments={appointments}
              onSelectAppointment={setSelectedAppointmentId}
              onReschedule={handleReschedule}
            />
          )}
          {view === "list" && (
            <ListView appointments={appointments} onSelectAppointment={setSelectedAppointmentId} />
          )}
        </>
      )}

      <AppointmentDetailDialog
        appointment={selectedAppointment}
        open={selectedAppointmentId !== null}
        onOpenChange={(open) => !open && setSelectedAppointmentId(null)}
        eligibleStaff={eligibleStaff}
        isSaving={updateBooking.isPending}
        onReassign={(staffId) => {
          if (!selectedAppointmentId) return
          updateBooking.mutate({ bookingId: selectedAppointmentId, patch: { staffId } })
        }}
        onCancel={() => {
          if (!selectedAppointmentId) return
          updateBooking.mutate(
            { bookingId: selectedAppointmentId, patch: { status: "cancelled" } },
            { onSuccess: () => setSelectedAppointmentId(null) },
          )
        }}
      />
    </div>
  )
}
