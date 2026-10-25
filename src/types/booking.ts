export type BookingStatus = "confirmed" | "pending" | "cancelled" | "no_show"

export type CancelledBy = "customer" | "business"

export type Booking = {
  id: string
  businessId: string
  serviceId: string
  staffId: string
  customerId: string | null
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
  /** Secret id behind the guest's manage link; never guessable like `id`. */
  uid: string
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
