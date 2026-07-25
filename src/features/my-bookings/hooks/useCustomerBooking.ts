import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { customerBookingsApi } from "@/features/my-bookings/api/customerBookingsApi"
import { useAuthStore } from "@/stores/authStore"

export function useCustomerBooking(bookingId: string) {
  const customerId = useAuthStore((state) => state.actorId)

  return useQuery({
    queryKey: queryKeys.customerBookings.byId(bookingId),
    queryFn: () => customerBookingsApi.byId(customerId!, bookingId),
    enabled: Boolean(customerId),
  })
}
