import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { availabilityApi } from "@/features/staff-calendar/api/availabilityApi"
import type { DayAvailability } from "@/types"

export function useUpdateAvailability(businessId: string, staffId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (weekly: DayAvailability[]) =>
      availabilityApi.updateWeekly(businessId, staffId, weekly),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.availability(businessId, staffId) })
      toast.success("Availability saved.")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
