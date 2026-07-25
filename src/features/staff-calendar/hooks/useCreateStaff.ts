import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { staffApi } from "@/features/staff-calendar/api/staffApi"
import type { StaffFormInput } from "@/features/staff-calendar/schemas/staffFormSchema"

export function useCreateStaff(businessId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: StaffFormInput) => staffApi.create(businessId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.list(businessId) })
      toast.success("Staff member added.")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
