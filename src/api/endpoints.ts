export const endpoints = {
  businesses: {
    list: () => `/api/businesses`,
    bySlug: (slug: string) => `/api/businesses/${slug}`,
    create: () => `/api/businesses`,
  },
  services: {
    list: (businessSlug: string) => `/api/businesses/${businessSlug}/services`,
    ownerList: () => `/api/business/services`,
    create: () => `/api/services`,
    byId: (serviceId: string) => `/api/services/${serviceId}`,
  },
  staff: {
    list: (businessSlug: string) => `/api/businesses/${businessSlug}/staff`,
    ownerList: () => `/api/business/staff`,
    create: () => `/api/staff`,
    byId: (staffId: string) => `/api/staff/${staffId}`,
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
    ownerList: () => `/api/business/bookings`,
    ownerById: (bookingId: string) => `/api/business/bookings/${bookingId}`,
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
