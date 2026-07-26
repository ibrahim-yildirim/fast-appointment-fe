import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { customerBookingsApi } from "@/features/my-bookings/api/customerBookingsApi"
import i18n from "@/i18n"

export function useCancelCustomerBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: string) => customerBookingsApi.cancel(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customerBookings.list() })
      toast.success(i18n.t("booking.cancelledToast"))
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
