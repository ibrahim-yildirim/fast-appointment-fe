import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { bookingsApi, type CreateBookingInput } from "@/features/booking/api/bookingsApi"
import i18n from "@/i18n"

export function useCreateBooking(businessId: string, businessSlug: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingsApi.create(businessId, input),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.list(businessId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.customerBookings.list() })
      navigate(`/${businessSlug}/booking/${booking.id}/confirmation`)
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
