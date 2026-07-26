import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { staffApi } from "@/features/staff-calendar/api/staffApi"
import type { StaffFormInput } from "@/features/staff-calendar/schemas/staffFormSchema"
import i18n from "@/i18n"

export function useCreateStaff(businessId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: StaffFormInput) => staffApi.create(businessId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.list(businessId) })
      toast.success(i18n.t("staff.createdToast"))
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
