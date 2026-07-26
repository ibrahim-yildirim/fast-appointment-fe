import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { servicesApi } from "@/features/services/api/servicesApi"
import i18n from "@/i18n"

export function useDeleteService(businessId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (serviceId: string) => servicesApi.remove(businessId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.list(businessId) })
      toast.success(i18n.t("services.deletedToast"))
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
