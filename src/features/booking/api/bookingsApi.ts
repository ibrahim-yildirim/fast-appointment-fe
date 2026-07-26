import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { businessNow } from "@/lib/datetime"
import { ApiError } from "@/api/types"
import { bookings } from "@/fixtures"
import { generateBookingReference } from "@/lib/bookingReference"
import type { Booking } from "@/types"

export type CreateBookingInput = {
  serviceId: string
  staffId: string
  customerId: string | null
  guestName: string | null
  guestPhone: string | null
  guestEmail: string | null
  startsAt: string
  endsAt: string
  notes: string
}

/**
 * Cap on how many upcoming bookings one phone number can hold at a single business.
 * This is a courtesy guardrail only — it runs in the browser and is trivially
 * bypassable. Real enforcement (rate limiting, SMS verification) belongs on the
 * backend; these same rules should be reimplemented there.
 */
const GUEST_UPCOMING_LIMIT = 3

/**
 * Comparable key for a phone number. People write the same number many ways
 * ("+90 555 111 2233", "0555 111 2233"), so we strip formatting and compare only
 * the trailing significant digits — this ignores country-code and leading-zero
 * differences without needing a full phone-parsing library.
 */
function phoneKey(phone: string) {
  const digits = phone.replace(/[^0-9]/g, "")
  return digits.length > 9 ? digits.slice(-9) : digits
}

function assertGuestBookingAllowed(businessId: string, input: CreateBookingInput) {
  if (!input.guestPhone) return

  const phone = phoneKey(input.guestPhone)
  const sameContact = bookings.filter(
    (booking) =>
      booking.businessId === businessId &&
      booking.status !== "cancelled" &&
      booking.guestPhone !== null &&
      phoneKey(booking.guestPhone) === phone,
  )

  const duplicate = sameContact.some(
    (booking) => booking.serviceId === input.serviceId && booking.startsAt === input.startsAt,
  )
  if (duplicate) {
    throw new ApiError({
      timestamp: new Date().toISOString(),
      status: 409,
      error: "Conflict",
      message: "errors.duplicateBooking",
      path: endpoints.bookings.list(businessId),
    })
  }

  const now = businessNow().getTime()
  const upcoming = sameContact.filter((booking) => new Date(booking.startsAt).getTime() >= now)
  if (upcoming.length >= GUEST_UPCOMING_LIMIT) {
    throw new ApiError({
      timestamp: new Date().toISOString(),
      status: 429,
      error: "Too Many Requests",
      message: "errors.guestBookingLimit",
      path: endpoints.bookings.list(businessId),
    })
  }
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
      assertGuestBookingAllowed(businessId, input)
      const booking: Booking = {
        id: `booking-${Date.now()}`,
        reference: generateBookingReference(),
        businessId,
        status: "confirmed",
        ...input,
      }
      bookings.push(booking)
      return booking
    }
    return apiClient.post<Booking>(endpoints.bookings.list(businessId), input)
  },

  lookupByReference: async (reference: string, phone: string): Promise<Booking | undefined> => {
    if (USE_FIXTURES) {
      const normalized = phoneKey(phone)
      return bookings.find(
        (booking) =>
          booking.reference.toUpperCase() === reference.trim().toUpperCase() &&
          booking.guestPhone !== null &&
          phoneKey(booking.guestPhone) === normalized,
      )
    }
    return apiClient.get<Booking>(
      `${endpoints.bookings.lookup()}?reference=${encodeURIComponent(reference)}&phone=${encodeURIComponent(phone)}`,
    )
  },

  cancelByReference: async (reference: string, phone: string): Promise<void> => {
    if (USE_FIXTURES) {
      const normalized = phoneKey(phone)
      const index = bookings.findIndex(
        (booking) =>
          booking.reference.toUpperCase() === reference.trim().toUpperCase() &&
          booking.guestPhone !== null &&
          phoneKey(booking.guestPhone) === normalized,
      )
      if (index === -1) throw new Error("errors.bookingNotFound")
      bookings[index] = { ...bookings[index], status: "cancelled" }
      return
    }
    return apiClient.patch<void>(endpoints.bookings.lookup(), { reference, phone, status: "cancelled" })
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
      if (index === -1) throw new Error("errors.bookingNotFound")
      const updated: Booking = { ...bookings[index], ...patch }
      bookings[index] = updated
      return updated
    }
    return apiClient.patch<Booking>(endpoints.bookings.byId(businessId, bookingId), patch)
  },
}
