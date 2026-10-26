import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toBackendId, toBusinessLocal } from "@/api/mappers"
import { ApiError } from "@/api/types"
import { bookings, customers } from "@/fixtures"
import {
  toCustomerBooking,
  toFixtureCustomerBooking,
  type CustomerBookingResponse,
  type CustomerBookingView,
} from "@/features/my-bookings/api/customerBookingsApi"
import type { BusinessRef } from "@/types"

export type CreateGuestBookingInput = {
  serviceId: string
  staffId: string
  startsAt: string
  endsAt: string
  name: string
  phone: string
  email: string
}

/** Guests have no account: the booking's uid is what lets them see or cancel it later. */
export const guestBookingsApi = {
  create: async (business: BusinessRef, input: CreateGuestBookingInput): Promise<string> => {
    if (USE_FIXTURES) {
      const customerId = `cust-${Date.now()}`
      customers.push({ id: customerId, name: input.name, phone: input.phone, email: input.email })
      const id = `booking-${Date.now()}`
      bookings.push({
        id,
        businessId: business.id,
        serviceId: input.serviceId,
        staffId: input.staffId,
        customerId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: "confirmed",
        notes: "",
        cancelledBy: null,
        cancellationReason: null,
      })
      return id
    }
    const response = await apiClient.post<CustomerBookingResponse>(
      endpoints.bookings.guestCreate(business.slug),
      {
        serviceId: toBackendId(input.serviceId),
        staffId: toBackendId(input.staffId),
        startsAt: toBusinessLocal(input.startsAt),
        customerName: input.name,
        customerPhone: input.phone,
        customerEmail: input.email || null,
      },
    )
    return response.uid
  },

  /** Null when the link is wrong or the booking no longer exists. */
  byUid: async (uid: string): Promise<CustomerBookingView | null> => {
    if (USE_FIXTURES) {
      const booking = bookings.find((candidate) => candidate.id === uid)
      return booking ? toFixtureCustomerBooking(booking) : null
    }
    try {
      return toCustomerBooking(
        await apiClient.get<CustomerBookingResponse>(endpoints.bookings.manage(uid)),
      )
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null
      throw error
    }
  },

  cancel: async (uid: string, reason: string | null): Promise<void> => {
    if (USE_FIXTURES) {
      const index = bookings.findIndex((booking) => booking.id === uid)
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
    return apiClient.delete<void>(endpoints.bookings.manage(uid), { reason })
  },
}
