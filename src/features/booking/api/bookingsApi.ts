import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toBackendId, toBusinessLocal, toId, toWallClock } from "@/api/mappers"
import { businessNow } from "@/lib/datetime"
import { ApiError } from "@/api/types"
import { bookings } from "@/fixtures"
import { generateBookingReference } from "@/lib/bookingReference"
import type { Booking, BookingStatus, CancelledBy } from "@/types"

type BookingResponse = {
  id: number
  businessId: number
  serviceId: number
  staffId: number
  customerId: number | null
  startsAt: string
  endsAt: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "NO_SHOW"
  notes: string | null
  cancelledBy: "CUSTOMER" | "BUSINESS" | null
  cancellationReason: string | null
}

// Guest fields and the reference code don't exist in the backend yet (guest booking is postponed).
function toBooking(response: BookingResponse): Booking {
  return {
    id: toId(response.id),
    reference: "",
    businessId: toId(response.businessId),
    serviceId: toId(response.serviceId),
    staffId: toId(response.staffId),
    customerId: response.customerId === null ? null : toId(response.customerId),
    guestName: null,
    guestPhone: null,
    guestEmail: null,
    startsAt: toWallClock(response.startsAt),
    endsAt: toWallClock(response.endsAt),
    status: response.status.toLowerCase() as BookingStatus,
    notes: response.notes ?? "",
    cancelledBy: response.cancelledBy === null ? null : (response.cancelledBy.toLowerCase() as CancelledBy),
    cancellationReason: response.cancellationReason,
  }
}

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
    const response = await apiClient.get<BookingResponse[]>(endpoints.bookings.ownerList())
    return response.map(toBooking)
  },

  byId: async (businessId: string, bookingId: string): Promise<Booking | undefined> => {
    if (USE_FIXTURES) {
      return bookings.find(
        (booking) => booking.businessId === businessId && booking.id === bookingId,
      )
    }
    return apiClient.get<Booking>(endpoints.bookings.byId(businessId, bookingId))
  },

  create: async (businessId: string, input: CreateBookingInput): Promise<Pick<Booking, "id">> => {
    if (USE_FIXTURES) {
      assertGuestBookingAllowed(businessId, input)
      const booking: Booking = {
        id: `booking-${Date.now()}`,
        reference: generateBookingReference(),
        businessId,
        status: "confirmed",
        cancelledBy: null,
        cancellationReason: null,
        ...input,
      }
      bookings.push(booking)
      return booking
    }
    // Customers only; the backend takes the customer from the token and computes endsAt itself.
    const response = await apiClient.post<{ id: number }>(endpoints.customerBookings.list(), {
      businessId: toBackendId(businessId),
      serviceId: toBackendId(input.serviceId),
      staffId: toBackendId(input.staffId),
      startsAt: toBusinessLocal(input.startsAt),
      notes: input.notes,
    })
    return { id: toId(response.id) }
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
    patch: Partial<
      Pick<Booking, "staffId" | "startsAt" | "endsAt" | "status" | "notes" | "cancellationReason">
    >,
  ): Promise<Booking> => {
    if (USE_FIXTURES) {
      const index = bookings.findIndex(
        (booking) => booking.businessId === businessId && booking.id === bookingId,
      )
      if (index === -1) throw new Error("errors.bookingNotFound")
      const updated: Booking = {
        ...bookings[index],
        ...patch,
        ...(patch.status === "cancelled" && { cancelledBy: "business" as const }),
      }
      bookings[index] = updated
      return updated
    }
    if (patch.status === "no_show") {
      const response = await apiClient.put<BookingResponse>(
        endpoints.bookings.ownerNoShow(bookingId),
      )
      return toBooking(response)
    }
    // The backend cancels with DELETE and replaces the whole booking with PUT.
    if (patch.status === "cancelled") {
      await apiClient.delete<void>(endpoints.bookings.ownerById(bookingId), {
        reason: patch.cancellationReason ?? null,
      })
      return bookingsApi.byIdForOwner(businessId, bookingId)
    }
    const current = await bookingsApi.byIdForOwner(businessId, bookingId)
    const merged = { ...current, ...patch }
    const response = await apiClient.put<BookingResponse>(endpoints.bookings.ownerById(bookingId), {
      serviceId: toBackendId(merged.serviceId),
      staffId: toBackendId(merged.staffId),
      startsAt: toBusinessLocal(merged.startsAt),
      endsAt: toBusinessLocal(merged.endsAt),
      notes: merged.notes,
    })
    return toBooking(response)
  },

  byIdForOwner: async (businessId: string, bookingId: string): Promise<Booking> => {
    const booking = (await bookingsApi.list(businessId)).find((item) => item.id === bookingId)
    if (!booking) throw new Error("errors.bookingNotFound")
    return booking
  },
}
