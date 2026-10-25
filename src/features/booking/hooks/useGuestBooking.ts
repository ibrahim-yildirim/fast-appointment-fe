import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { guestBookingsApi } from "@/features/booking/api/guestBookingsApi"

export function useGuestBooking(uid: string) {
  return useQuery({
    queryKey: queryKeys.guestBookings.byUid(uid),
    queryFn: () => guestBookingsApi.byUid(uid),
  })
}
