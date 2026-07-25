import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { bookings, businesses, services, staff } from "@/fixtures"
import type { BookingSummary } from "@/types"

export type CustomerBookingView = BookingSummary

export const customerBookingsApi = {
  list: async (customerId: string): Promise<CustomerBookingView[]> => {
    if (USE_FIXTURES) {
      return bookings
        .filter((booking) => booking.customerId === customerId)
        .map((booking) => {
          const business = businesses.find((candidate) => candidate.id === booking.businessId)
          const service = services.find((candidate) => candidate.id === booking.serviceId)
          const staffMember = staff.find((candidate) => candidate.id === booking.staffId)
          return {
            id: booking.id,
            reference: booking.reference,
            businessId: booking.businessId,
            businessName: business?.name ?? "Unknown business",
            businessSlug: business?.slug ?? "",
            serviceName: service?.name ?? "Unknown service",
            staffName: staffMember?.name ?? "Unknown staff",
            startsAt: booking.startsAt,
            endsAt: booking.endsAt,
            status: booking.status,
            price: service?.price ?? 0,
            notes: booking.notes,
          }
        })
    }
    return apiClient.get<CustomerBookingView[]>(endpoints.customerBookings.list())
  },

  byId: async (customerId: string, bookingId: string): Promise<CustomerBookingView | undefined> => {
    if (USE_FIXTURES) {
      const list = await customerBookingsApi.list(customerId)
      return list.find((booking) => booking.id === bookingId)
    }
    return apiClient.get<CustomerBookingView>(endpoints.customerBookings.byId(bookingId))
  },

  cancel: async (bookingId: string): Promise<void> => {
    if (USE_FIXTURES) {
      const index = bookings.findIndex((booking) => booking.id === bookingId)
      if (index !== -1) bookings[index] = { ...bookings[index], status: "cancelled" }
      return
    }
    return apiClient.patch<void>(endpoints.customerBookings.byId(bookingId), {
      status: "cancelled",
    })
  },
}
