import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toId, toWallClock } from "@/api/mappers"
import { bookings, businesses, services, staff } from "@/fixtures"
import type { BookingStatus, BookingSummary, CancelledBy } from "@/types"

export type CustomerBookingView = BookingSummary

type CustomerBookingResponse = {
  id: number
  businessId: number
  businessName: string
  businessSlug: string
  serviceName: string
  staffName: string
  startsAt: string
  endsAt: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "NO_SHOW"
  price: number
  notes: string | null
  cancelledBy: "CUSTOMER" | "BUSINESS" | null
  cancellationReason: string | null
}

// There is no booking reference in the backend yet; it arrives with guest booking.
function toCustomerBooking(response: CustomerBookingResponse): CustomerBookingView {
  return {
    id: toId(response.id),
    reference: "",
    businessId: toId(response.businessId),
    businessName: response.businessName,
    businessSlug: response.businessSlug,
    serviceName: response.serviceName,
    staffName: response.staffName,
    startsAt: toWallClock(response.startsAt),
    endsAt: toWallClock(response.endsAt),
    status: response.status.toLowerCase() as BookingStatus,
    price: response.price,
    notes: response.notes ?? "",
    cancelledBy: response.cancelledBy === null ? null : (response.cancelledBy.toLowerCase() as CancelledBy),
    cancellationReason: response.cancellationReason,
  }
}

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
            cancelledBy: booking.cancelledBy,
            cancellationReason: booking.cancellationReason,
            notes: booking.notes,
          }
        })
    }
    const response = await apiClient.get<CustomerBookingResponse[]>(
      endpoints.customerBookings.list(),
    )
    return response.map(toCustomerBooking)
  },

  byId: async (customerId: string, bookingId: string): Promise<CustomerBookingView | null> => {
    // The backend has no single-booking read for customers, so this reads from the list.
    const list = await customerBookingsApi.list(customerId)
    return list.find((booking) => booking.id === bookingId) ?? null
  },

  cancel: async (bookingId: string, reason: string | null): Promise<void> => {
    if (USE_FIXTURES) {
      const index = bookings.findIndex((booking) => booking.id === bookingId)
      if (index !== -1) {
        bookings[index] = {
          ...bookings[index],
          status: "cancelled",
          cancelledBy: "customer",
          cancellationReason: reason,
        }
      }
      return
    }
    // The backend keeps the row and marks it CANCELLED.
    return apiClient.delete<void>(endpoints.customerBookings.byId(bookingId), { reason })
  },
}
