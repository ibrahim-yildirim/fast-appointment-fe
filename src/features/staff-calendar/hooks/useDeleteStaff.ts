import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { staffApi } from "@/features/staff-calendar/api/staffApi"
import i18n from "@/i18n"

export function useDeleteStaff(businessId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (staffId: string) => staffApi.remove(businessId, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.list(businessId) })
      toast.success(i18n.t("staff.deletedToast"))
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
