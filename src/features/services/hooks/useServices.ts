import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { servicesApi } from "@/features/services/api/servicesApi"
import type { BusinessRef } from "@/types"

export function useServices(business: BusinessRef) {
  return useQuery({
    queryKey: queryKeys.services.list(business.id),
    queryFn: () => servicesApi.list(business),
  })
}
