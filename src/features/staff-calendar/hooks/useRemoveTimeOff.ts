import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { availabilityApi } from "@/features/staff-calendar/api/availabilityApi"
import i18n from "@/i18n"

export function useRemoveTimeOff(businessId: string, staffId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (timeOffId: string) => availabilityApi.removeTimeOff(businessId, staffId, timeOffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.timeOff(businessId, staffId) })
      toast.success(i18n.t("staff.timeOffRemovedToast"))
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
