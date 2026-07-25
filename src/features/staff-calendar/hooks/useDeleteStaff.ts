import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { staffApi } from "@/features/staff-calendar/api/staffApi"

export function useDeleteStaff(businessId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (staffId: string) => staffApi.remove(businessId, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.list(businessId) })
      toast.success("Staff member removed.")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
