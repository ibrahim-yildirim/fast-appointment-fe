export type BookingStatus = "confirmed" | "pending" | "cancelled" | "no_show"

export type CancelledBy = "customer" | "business"

export type Booking = {
  id: string
  /** Short human-friendly code guests use to look their booking up again. */
  reference: string
  businessId: string
  serviceId: string
  staffId: string
  /** Null when the booking was made by a guest without an account. */
  customerId: string | null
  guestName: string | null
  guestPhone: string | null
  guestEmail: string | null
  startsAt: string
  endsAt: string
  status: BookingStatus
  notes: string
  cancelledBy: CancelledBy | null
  cancellationReason: string | null
}

/** Flattened booking with business/service/staff names resolved, for display. */
export type BookingSummary = {
  id: string
  reference: string
  businessId: string
  businessName: string
  businessSlug: string
  serviceName: string
  staffName: string
  startsAt: string
  endsAt: string
  status: BookingStatus
  price: number
  notes: string
  cancelledBy: CancelledBy | null
  cancellationReason: string | null
}
