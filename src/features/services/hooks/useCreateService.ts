import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { servicesApi } from "@/features/services/api/servicesApi"
import type { ServiceFormInput } from "@/features/services/schemas/serviceFormSchema"
import i18n from "@/i18n"

export function useCreateService(businessId: string, businessSlug: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: ServiceFormInput) => servicesApi.create(businessId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.list(businessId) })
      toast.success(i18n.t("services.createdToast"))
      navigate(`/${businessSlug}/dashboard/services`)
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
