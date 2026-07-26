import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { servicesApi } from "@/features/services/api/servicesApi"
import type { ServiceFormInput } from "@/features/services/schemas/serviceFormSchema"
import i18n from "@/i18n"

export function useUpdateService(businessId: string, serviceId: string, businessSlug: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: ServiceFormInput) => servicesApi.update(businessId, serviceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.list(businessId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.services.byId(businessId, serviceId) })
      toast.success(i18n.t("services.updatedToast"))
      navigate(`/${businessSlug}/dashboard/services`)
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
