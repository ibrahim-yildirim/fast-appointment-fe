export const endpoints = {
  businesses: {
    list: () => `/api/businesses`,
    bySlug: (slug: string) => `/api/businesses/${slug}`,
    create: () => `/api/businesses`,
  },
  services: {
    list: (businessId: string) => `/api/businesses/${businessId}/services`,
    byId: (businessId: string, serviceId: string) =>
      `/api/businesses/${businessId}/services/${serviceId}`,
  },
  staff: {
    list: (businessId: string) => `/api/businesses/${businessId}/staff`,
    byId: (businessId: string, staffId: string) =>
      `/api/businesses/${businessId}/staff/${staffId}`,
    availability: (businessId: string, staffId: string) =>
      `/api/businesses/${businessId}/staff/${staffId}/availability`,
    timeOff: (businessId: string, staffId: string) =>
      `/api/businesses/${businessId}/staff/${staffId}/time-off`,
    timeOffById: (businessId: string, staffId: string, timeOffId: string) =>
      `/api/businesses/${businessId}/staff/${staffId}/time-off/${timeOffId}`,
  },
  bookings: {
    lookup: () => `/api/bookings/lookup`,
    list: (businessId: string) => `/api/businesses/${businessId}/bookings`,
    byId: (businessId: string, bookingId: string) =>
      `/api/businesses/${businessId}/bookings/${bookingId}`,
  },
  customers: {
    list: () => `/api/customers`,
  },
  customerBookings: {
    list: () => `/api/account/bookings`,
    byId: (bookingId: string) => `/api/account/bookings/${bookingId}`,
  },
  auth: {
    customerLogin: () => `/api/auth/login`,
    customerRegister: () => `/api/auth/register`,
    businessLogin: () => `/api/business/auth/login`,
    businessRegister: () => `/api/business/auth/register`,
  },
}
