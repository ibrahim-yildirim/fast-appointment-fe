import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { guestBookingsApi } from "@/features/booking/api/guestBookingsApi"
import i18n from "@/i18n"

export function useCancelGuestBooking(uid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reason: string | null) => guestBookingsApi.cancel(uid, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guestBookings.byUid(uid) })
      toast.success(i18n.t("booking.cancelledToast"))
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
