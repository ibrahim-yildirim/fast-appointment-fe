import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { customerBookingsApi } from "@/features/my-bookings/api/customerBookingsApi"
import { useAuthStore } from "@/stores/authStore"

export function useCustomerBookings() {
  const customerId = useAuthStore((state) => state.actorId)

  return useQuery({
    queryKey: queryKeys.customerBookings.list(),
    queryFn: () => customerBookingsApi.list(customerId!),
    enabled: Boolean(customerId),
  })
}
