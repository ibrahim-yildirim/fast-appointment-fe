export const endpoints = {
  businesses: {
    list: () => `/api/businesses`,
    bySlug: (slug: string) => `/api/businesses/${slug}`,
    create: () => `/api/businesses`,
    ownerUpdate: () => `/api/business`,
  },
  services: {
    list: (businessSlug: string) => `/api/businesses/${businessSlug}/services`,
    ownerList: () => `/api/business/services`,
    create: () => `/api/services`,
    byId: (serviceId: string) => `/api/services/${serviceId}`,
    slots: (businessSlug: string, serviceId: string, from: string, to: string) =>
      `/api/businesses/${businessSlug}/services/${serviceId}/slots?from=${from}&to=${to}`,
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
    list: (businessId: string) => `/api/businesses/${businessId}/bookings`,
    ownerList: () => `/api/business/bookings`,
    ownerById: (bookingId: string) => `/api/business/bookings/${bookingId}`,
    ownerNoShow: (bookingId: string) => `/api/business/bookings/${bookingId}/no-show`,
    byId: (businessId: string, bookingId: string) =>
      `/api/businesses/${businessId}/bookings/${bookingId}`,
    guestCreate: (businessSlug: string) => `/api/businesses/${businessSlug}/bookings`,
    manage: (uid: string) => `/api/bookings/manage/${uid}`,
  },
  customers: {
    list: () => `/api/customers`,
    create: () => `/api/customers`,
    me: () => `/api/customers/me`,
  },
  customerBookings: {
    list: () => `/api/bookings`,
    byId: (bookingId: string) => `/api/bookings/${bookingId}`,
  },
  auth: {
    customerLogin: () => `/api/auth/login`,
    customerRegister: () => `/api/auth/register`,
    businessLogin: () => `/api/business/auth/login`,
    businessRegister: () => `/api/business/auth/register`,
    refresh: () => `/api/auth/refresh`,
    logout: () => `/api/auth/logout`,
  },
}
