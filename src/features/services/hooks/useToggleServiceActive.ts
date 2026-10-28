import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { servicesApi } from "@/features/services/api/servicesApi"
import i18n from "@/i18n"
import type { Service } from "@/types"

export function useToggleServiceActive(businessId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ service, active }: { service: Service; active: boolean }) =>
      servicesApi.update(businessId, service.id, {
        name: service.name,
        description: service.description,
        durationMinutes: service.durationMinutes,
        price: service.price,
        active,
        eligibleStaffIds: service.eligibleStaffIds,
      }),
    onSuccess: (_, { active }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.list(businessId) })
      toast.success(i18n.t(active ? "services.activatedToast" : "services.deactivatedToast"))
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
