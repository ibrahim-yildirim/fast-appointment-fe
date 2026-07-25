import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { bookingsApi } from "@/features/booking/api/bookingsApi"
import type { Booking } from "@/types"

type UpdateBookingArgs = {
  bookingId: string
  patch: Partial<Pick<Booking, "staffId" | "startsAt" | "endsAt" | "status" | "notes">>
}

export function useUpdateBooking(businessId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, patch }: UpdateBookingArgs) =>
      bookingsApi.update(businessId, bookingId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.list(businessId) })
      toast.success("Booking updated.")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
