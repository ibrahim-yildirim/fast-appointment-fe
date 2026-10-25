import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toId, toWallClock } from "@/api/mappers"
import { bookings, businesses, services, staff } from "@/fixtures"
import type { Booking, BookingStatus, BookingSummary, CancelledBy } from "@/types"

export type CustomerBookingView = BookingSummary

export type CustomerBookingResponse = {
  id: number
  uid: string
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

export function toCustomerBooking(response: CustomerBookingResponse): CustomerBookingView {
  return {
    id: toId(response.id),
    uid: response.uid,
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

/** Fixture mode: resolves names the way the backend does. The fixture uid is just the id. */
export function toFixtureCustomerBooking(booking: Booking): CustomerBookingView {
  const business = businesses.find((candidate) => candidate.id === booking.businessId)
  const service = services.find((candidate) => candidate.id === booking.serviceId)
  const staffMember = staff.find((candidate) => candidate.id === booking.staffId)
  return {
    id: booking.id,
    uid: booking.id,
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
}

export const customerBookingsApi = {
  list: async (customerId: string): Promise<CustomerBookingView[]> => {
    if (USE_FIXTURES) {
      return bookings
        .filter((booking) => booking.customerId === customerId)
        .map(toFixtureCustomerBooking)
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
