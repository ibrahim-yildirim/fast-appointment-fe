import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { servicesApi } from "@/features/services/api/servicesApi"

export function useService(businessId: string, serviceId: string) {
  return useQuery({
    queryKey: queryKeys.services.byId(businessId, serviceId),
    queryFn: () => servicesApi.byId(businessId, serviceId),
  })
}
