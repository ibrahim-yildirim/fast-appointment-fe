import { useMemo } from "react"

import { useBookings } from "@/features/booking/hooks/useBookings"
import { useCustomers } from "@/features/customers/hooks/useCustomers"
import { useServices } from "@/features/services/hooks/useServices"
import { useStaff } from "@/features/staff-calendar/hooks/useStaff"
import type { BookingStatus } from "@/types"

export type CalendarAppointment = {
  id: string
  customerName: string
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
}

export type CalendarFilters = {
  search: string
  staffId: string
  serviceId: string
  status: string
}

export const defaultCalendarFilters: CalendarFilters = {
  search: "",
  staffId: "all",
  serviceId: "all",
  status: "all",
}

export function useCalendarAppointments(businessId: string, filters: CalendarFilters) {
  const bookingsQuery = useBookings(businessId)
  const servicesQuery = useServices(businessId)
  const staffQuery = useStaff(businessId)
  const customersQuery = useCustomers()

  const appointments = useMemo(() => {
    const bookings = bookingsQuery.data ?? []
    const services = servicesQuery.data ?? []
    const staff = staffQuery.data ?? []
    const customers = customersQuery.data ?? []

    const mapped = bookings.flatMap((booking) => {
      const service = services.find((candidate) => candidate.id === booking.serviceId)
      const staffMember = staff.find((candidate) => candidate.id === booking.staffId)
      if (!service || !staffMember) return []

      const customer = customers.find((candidate) => candidate.id === booking.customerId)
      const customerName = customer?.name ?? booking.guestName ?? "Unknown customer"

      const appointment: CalendarAppointment = {
        id: booking.id,
        customerName,
        serviceName: service.name,
        serviceId: service.id,
        price: service.price,
        durationMinutes: service.durationMinutes,
        staffId: staffMember.id,
        staffName: staffMember.name,
        staffColor: staffMember.colorTag,
        status: booking.status,
        dateKey: booking.startsAt.slice(0, 10),
        startTime: booking.startsAt.slice(11, 16),
        endTime: booking.endsAt.slice(11, 16),
        notes: booking.notes,
      }
      return [appointment]
    })

    return mapped.filter((appointment) => {
      if (filters.staffId !== "all" && appointment.staffId !== filters.staffId) return false
      if (filters.serviceId !== "all" && appointment.serviceId !== filters.serviceId) return false
      if (filters.status !== "all" && appointment.status !== filters.status) return false
      if (filters.search) {
        const query = filters.search.toLowerCase()
        const matches =
          appointment.customerName.toLowerCase().includes(query) ||
          appointment.serviceName.toLowerCase().includes(query)
        if (!matches) return false
      }
      return true
    })
  }, [bookingsQuery.data, servicesQuery.data, staffQuery.data, customersQuery.data, filters])

  const isLoading =
    bookingsQuery.isLoading ||
    servicesQuery.isLoading ||
    staffQuery.isLoading ||
    customersQuery.isLoading

  return { appointments, isLoading }
}
