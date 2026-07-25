import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { staffApi } from "@/features/staff-calendar/api/staffApi"
import type { StaffFormInput } from "@/features/staff-calendar/schemas/staffFormSchema"

export function useUpdateStaff(businessId: string, staffId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: StaffFormInput) => staffApi.update(businessId, staffId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.list(businessId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.byId(businessId, staffId) })
      toast.success("Staff member updated.")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
