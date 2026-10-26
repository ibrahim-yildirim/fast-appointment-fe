import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { businessApi, type UpdateBusinessInput } from "@/features/business/api/businessApi"
import i18n from "@/i18n"

export function useUpdateBusiness(businessId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateBusinessInput) => businessApi.update(businessId, input),
    onSuccess: () => {
      // The by-slug query feeds the dashboard context and the public pages.
      queryClient.invalidateQueries({ queryKey: queryKeys.business.list() })
      toast.success(i18n.t("settings.savedToast"))
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
