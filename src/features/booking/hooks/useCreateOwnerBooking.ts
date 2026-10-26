import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { bookingsApi, type CreateOwnerBookingInput } from "@/features/booking/api/bookingsApi"
import i18n from "@/i18n"

export function useCreateOwnerBooking(businessId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateOwnerBookingInput) => bookingsApi.createForOwner(businessId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.list(businessId) })
      // A new phone number adds a customer to the notebook.
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.list() })
      toast.success(i18n.t("dashboard.bookingCreatedToast"))
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
