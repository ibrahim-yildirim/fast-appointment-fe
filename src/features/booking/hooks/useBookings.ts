import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { bookingsApi } from "@/features/booking/api/bookingsApi"

export function useBookings(businessId: string) {
  return useQuery({
    queryKey: queryKeys.bookings.list(businessId),
    queryFn: () => bookingsApi.list(businessId),
  })
}
