import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { customerBookingsApi } from "@/features/my-bookings/api/customerBookingsApi"
import i18n from "@/i18n"

export function useCancelCustomerBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string | null }) =>
      customerBookingsApi.cancel(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customerBookings.list() })
      toast.success(i18n.t("booking.cancelledToast"))
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
