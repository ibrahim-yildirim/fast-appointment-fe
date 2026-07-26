import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { availabilityApi } from "@/features/staff-calendar/api/availabilityApi"
import type { DayAvailability } from "@/types"
import i18n from "@/i18n"

export function useUpdateAvailability(businessId: string, staffId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (weekly: DayAvailability[]) =>
      availabilityApi.updateWeekly(businessId, staffId, weekly),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.availability(businessId, staffId) })
      toast.success(i18n.t("staff.availabilitySavedToast"))
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
