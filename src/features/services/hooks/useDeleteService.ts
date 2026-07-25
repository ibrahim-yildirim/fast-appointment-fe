import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { servicesApi } from "@/features/services/api/servicesApi"

export function useDeleteService(businessId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (serviceId: string) => servicesApi.remove(businessId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.list(businessId) })
      toast.success("Service deleted.")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
