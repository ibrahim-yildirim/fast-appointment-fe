import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { availabilityApi } from "@/features/staff-calendar/api/availabilityApi"

export function useRemoveTimeOff(businessId: string, staffId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (timeOffId: string) => availabilityApi.removeTimeOff(businessId, staffId, timeOffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.timeOff(businessId, staffId) })
      toast.success("Time off removed.")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
