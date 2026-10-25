import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import {
  guestBookingsApi,
  type CreateGuestBookingInput,
} from "@/features/booking/api/guestBookingsApi"
import { saveGuestBooking } from "@/features/booking/lib/guestBookingStorage"
import i18n from "@/i18n"
import type { BusinessRef } from "@/types"

export function useCreateGuestBooking(business: BusinessRef) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: CreateGuestBookingInput) => guestBookingsApi.create(business, input),
    onSuccess: (uid) => {
      saveGuestBooking(uid)
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.list(business.id) })
      navigate(`/${business.slug}/booking/${uid}`)
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
