import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { servicesApi } from "@/features/services/api/servicesApi"

export function useServices(businessId: string) {
  return useQuery({
    queryKey: queryKeys.services.list(businessId),
    queryFn: () => servicesApi.list(businessId),
  })
}
