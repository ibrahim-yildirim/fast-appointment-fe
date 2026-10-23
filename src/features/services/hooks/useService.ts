import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { servicesApi } from "@/features/services/api/servicesApi"
import type { BusinessRef } from "@/types"

export function useService(business: BusinessRef, serviceId: string) {
  return useQuery({
    queryKey: queryKeys.services.byId(business.id, serviceId),
    queryFn: () => servicesApi.byId(business, serviceId),
    // React Query rejects undefined query data, so "not found" travels as null.
    select: (service) => service ?? undefined,
  })
}
