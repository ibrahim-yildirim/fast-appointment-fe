import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toBackendId, toBusinessLocal, toId, toWallClock } from "@/api/mappers"
import { bookings } from "@/fixtures"
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

function toBooking(response: BookingResponse): Booking {
  return {
    id: toId(response.id),
    businessId: toId(response.businessId),
    serviceId: toId(response.serviceId),
    staffId: toId(response.staffId),
    customerId: response.customerId === null ? null : toId(response.customerId),
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
  startsAt: string
  endsAt: string
  notes: string
}

// Walk-in or phone booking entered by the owner; the backend finds or creates the
// notebook customer by phone.
export type CreateOwnerBookingInput = {
  serviceId: string
  staffId: string
  startsAt: string
  endsAt: string
  customerName: string
  customerPhone: string
  customerEmail: string
  notes: string
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
      const booking: Booking = {
        id: `booking-${Date.now()}`,
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

  createForOwner: async (
    businessId: string,
    input: CreateOwnerBookingInput,
  ): Promise<Booking> => {
    if (USE_FIXTURES) {
      const booking: Booking = {
        id: `booking-${Date.now()}`,
        businessId,
        serviceId: input.serviceId,
        staffId: input.staffId,
        customerId: null,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: "confirmed",
        notes: input.notes,
        cancelledBy: null,
        cancellationReason: null,
      }
      bookings.push(booking)
      return booking
    }
    const response = await apiClient.post<BookingResponse>(endpoints.bookings.ownerList(), {
      serviceId: toBackendId(input.serviceId),
      staffId: toBackendId(input.staffId),
      startsAt: toBusinessLocal(input.startsAt),
      endsAt: toBusinessLocal(input.endsAt),
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail || null,
      notes: input.notes || null,
    })
    return toBooking(response)
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
