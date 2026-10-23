import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { servicesApi } from "@/features/services/api/servicesApi"

export function useOwnerServices(businessId: string) {
  return useQuery({
    queryKey: queryKeys.services.ownerList(businessId),
    queryFn: () => servicesApi.listForOwner(businessId),
  })
}
