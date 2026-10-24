import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { bookingsApi } from "@/features/booking/api/bookingsApi"
import type { Booking } from "@/types"
import i18n from "@/i18n"

type UpdateBookingArgs = {
  bookingId: string
  patch: Partial<
    Pick<Booking, "staffId" | "startsAt" | "endsAt" | "status" | "notes" | "cancellationReason">
  >
}

export function useUpdateBooking(businessId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, patch }: UpdateBookingArgs) =>
      bookingsApi.update(businessId, bookingId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.list(businessId) })
      toast.success(i18n.t("dashboard.bookingUpdatedToast"))
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
