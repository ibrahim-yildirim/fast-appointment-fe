import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { servicesApi } from "@/features/services/api/servicesApi"

/** Reads from the owner list, so inactive services can still be opened and edited. */
export function useOwnerService(businessId: string, serviceId: string) {
  return useQuery({
    queryKey: queryKeys.services.ownerList(businessId),
    queryFn: () => servicesApi.listForOwner(businessId),
    select: (services) => services.find((service) => service.id === serviceId),
  })
}
