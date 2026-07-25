export const queryKeys = {
  business: {
    list: () => ["business"] as const,
    bySlug: (slug: string) => ["business", slug] as const,
  },
  services: {
    list: (businessId: string) => ["services", businessId] as const,
    byId: (businessId: string, serviceId: string) =>
      ["services", businessId, serviceId] as const,
  },
  staff: {
    list: (businessId: string) => ["staff", businessId] as const,
    byId: (businessId: string, staffId: string) => ["staff", businessId, staffId] as const,
    availability: (businessId: string, staffId: string) =>
      ["staff", businessId, staffId, "availability"] as const,
    timeOff: (businessId: string, staffId: string) =>
      ["staff", businessId, staffId, "time-off"] as const,
  },
  bookings: {
    list: (businessId: string) => ["bookings", businessId] as const,
    byId: (businessId: string, bookingId: string) =>
      ["bookings", businessId, bookingId] as const,
  },
  customers: {
    list: () => ["customers"] as const,
  },
  customerBookings: {
    list: () => ["customer-bookings"] as const,
    byId: (bookingId: string) => ["customer-bookings", bookingId] as const,
  },
}
