import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { bookingsApi } from "@/features/booking/api/bookingsApi"

export function useBooking(businessId: string, bookingId: string) {
  return useQuery({
    queryKey: queryKeys.bookings.byId(businessId, bookingId),
    queryFn: () => bookingsApi.byId(businessId, bookingId),
  })
}
