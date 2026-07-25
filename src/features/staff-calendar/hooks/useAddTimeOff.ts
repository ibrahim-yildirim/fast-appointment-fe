import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { availabilityApi } from "@/features/staff-calendar/api/availabilityApi"
import type { TimeOffFormInput } from "@/features/staff-calendar/schemas/availabilityFormSchema"

export function useAddTimeOff(businessId: string, staffId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: TimeOffFormInput) => availabilityApi.addTimeOff(businessId, staffId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.timeOff(businessId, staffId) })
      toast.success("Time off added.")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
