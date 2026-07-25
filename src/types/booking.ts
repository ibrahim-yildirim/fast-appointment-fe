export type BookingStatus = "confirmed" | "pending" | "cancelled"

export type Booking = {
  id: string
  businessId: string
  serviceId: string
  staffId: string
  customerId: string
  startsAt: string
  endsAt: string
  status: BookingStatus
  notes: string
}
