import { differenceInMinutes } from "date-fns"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useBookings } from "@/features/booking/hooks/useBookings"
import { useCustomers } from "@/features/customers/hooks/useCustomers"
import { useOwnerServices } from "@/features/services/hooks/useOwnerServices"
import { useOwnerStaff } from "@/features/staff-calendar/hooks/useOwnerStaff"
import type { BookingStatus, BusinessRef, CancelledBy } from "@/types"

export type CalendarAppointment = {
  id: string
  customerName: string
  customerPhone: string
  serviceName: string
  serviceId: string
  price: number
  durationMinutes: number
  staffId: string
  staffName: string
  staffColor: string
  status: BookingStatus
  dateKey: string
  startTime: string
  endTime: string
  notes: string
  cancelledBy: CancelledBy | null
  cancellationReason: string | null
}

export type CalendarFilters = {
  staffId: string
  serviceId: string
  status: string
}

export const defaultCalendarFilters: CalendarFilters = {
  staffId: "all",
  serviceId: "all",
  status: "all",
}

export function useCalendarAppointments(business: BusinessRef, filters: CalendarFilters) {
  const { t } = useTranslation()
  const bookingsQuery = useBookings(business.id)
  const servicesQuery = useOwnerServices(business.id)
  const staffQuery = useOwnerStaff(business.id)
  const customersQuery = useCustomers()

  const appointments = useMemo(() => {
    const bookings = bookingsQuery.data ?? []
    const services = servicesQuery.data ?? []
    const staff = staffQuery.data ?? []
    const customers = customersQuery.data ?? []

    const mapped = bookings.flatMap((booking) => {
      const service = services.find((candidate) => candidate.id === booking.serviceId)
      const staffMember = staff.find((candidate) => candidate.id === booking.staffId)
      if (!staffMember) return []

      const customer = customers.find((candidate) => candidate.id === booking.customerId)
      const customerName = customer?.name ?? t("dashboard.unknownCustomer")

      const appointment: CalendarAppointment = {
        id: booking.id,
        customerName,
        customerPhone: customer?.phone ?? "",
        serviceName: service?.name ?? booking.serviceName ?? "",
        serviceId: booking.serviceId,
        price: service?.price ?? booking.servicePrice ?? 0,
        durationMinutes:
          service?.durationMinutes ??
          differenceInMinutes(new Date(booking.endsAt), new Date(booking.startsAt)),
        staffId: staffMember.id,
        staffName: staffMember.name,
        staffColor: staffMember.colorTag,
        status: booking.status,
        dateKey: booking.startsAt.slice(0, 10),
        startTime: booking.startsAt.slice(11, 16),
        endTime: booking.endsAt.slice(11, 16),
        notes: booking.notes,
        cancelledBy: booking.cancelledBy,
        cancellationReason: booking.cancellationReason,
      }
      return [appointment]
    })

    return mapped.filter((appointment) => {
      if (filters.staffId !== "all" && appointment.staffId !== filters.staffId) return false
      if (filters.serviceId !== "all" && appointment.serviceId !== filters.serviceId) return false
      if (filters.status !== "all" && appointment.status !== filters.status) return false
      return true
    })
  }, [bookingsQuery.data, servicesQuery.data, staffQuery.data, customersQuery.data, filters, t])

  const isLoading =
    bookingsQuery.isLoading ||
    servicesQuery.isLoading ||
    staffQuery.isLoading ||
    customersQuery.isLoading

  return { appointments, isLoading }
}
