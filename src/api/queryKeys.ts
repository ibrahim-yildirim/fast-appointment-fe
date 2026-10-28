export const queryKeys = {
  business: {
    list: () => ["business"] as const,
    bySlug: (slug: string) => ["business", slug] as const,
  },
  services: {
    list: (businessId: string) => ["services", businessId] as const,
    ownerList: (businessId: string) => ["services", businessId, "owner"] as const,
    byId: (businessId: string, serviceId: string) =>
      ["services", businessId, serviceId] as const,
  },
  staff: {
    list: (businessId: string) => ["staff", businessId] as const,
    ownerList: (businessId: string) => ["staff", businessId, "owner"] as const,
    byId: (businessId: string, staffId: string) => ["staff", businessId, staffId] as const,
  },
  bookings: {
    list: (businessId: string) => ["bookings", businessId] as const,
    byId: (businessId: string, bookingId: string) =>
      ["bookings", businessId, bookingId] as const,
  },
  slots: {
    // The viewer is part of the key: a logged-in customer also sees their own busy times.
    range: (businessId: string, serviceId: string, from: string, viewerId: string | null) =>
      ["slots", businessId, serviceId, from, viewerId] as const,
  },
  customers: {
    list: () => ["customers"] as const,
    me: () => ["customers", "me"] as const,
  },
  customerBookings: {
    list: () => ["customer-bookings"] as const,
    byId: (bookingId: string) => ["customer-bookings", bookingId] as const,
  },
  guestBookings: {
    byUid: (uid: string) => ["guest-bookings", uid] as const,
  },
}
