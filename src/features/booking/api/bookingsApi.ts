import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { bookings } from "@/fixtures"
import type { Booking } from "@/types"

export type CreateBookingInput = {
  serviceId: string
  staffId: string
  customerId: string
  startsAt: string
  endsAt: string
  notes: string
}

export const bookingsApi = {
  list: async (businessId: string): Promise<Booking[]> => {
    if (USE_FIXTURES) {
      return bookings.filter((booking) => booking.businessId === businessId)
    }
    return apiClient.get<Booking[]>(endpoints.bookings.list(businessId))
  },

  byId: async (businessId: string, bookingId: string): Promise<Booking | undefined> => {
    if (USE_FIXTURES) {
      return bookings.find(
        (booking) => booking.businessId === businessId && booking.id === bookingId,
      )
    }
    return apiClient.get<Booking>(endpoints.bookings.byId(businessId, bookingId))
  },

  create: async (businessId: string, input: CreateBookingInput): Promise<Booking> => {
    if (USE_FIXTURES) {
      const booking: Booking = {
        id: `booking-${Date.now()}`,
        businessId,
        status: "confirmed",
        ...input,
      }
      bookings.push(booking)
      return booking
    }
    return apiClient.post<Booking>(endpoints.bookings.list(businessId), input)
  },

  update: async (
    businessId: string,
    bookingId: string,
    patch: Partial<Pick<Booking, "staffId" | "startsAt" | "endsAt" | "status" | "notes">>,
  ): Promise<Booking> => {
    if (USE_FIXTURES) {
      const index = bookings.findIndex(
        (booking) => booking.businessId === businessId && booking.id === bookingId,
      )
      if (index === -1) throw new Error("Booking not found.")
      const updated: Booking = { ...bookings[index], ...patch }
      bookings[index] = updated
      return updated
    }
    return apiClient.patch<Booking>(endpoints.bookings.byId(businessId, bookingId), patch)
  },
}
