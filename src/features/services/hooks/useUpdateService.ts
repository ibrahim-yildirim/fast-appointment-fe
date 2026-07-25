import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { servicesApi } from "@/features/services/api/servicesApi"
import type { ServiceFormInput } from "@/features/services/schemas/serviceFormSchema"

export function useUpdateService(businessId: string, serviceId: string, businessSlug: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: ServiceFormInput) => servicesApi.update(businessId, serviceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.list(businessId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.services.byId(businessId, serviceId) })
      toast.success("Service updated.")
      navigate(`/${businessSlug}/dashboard/services`)
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
