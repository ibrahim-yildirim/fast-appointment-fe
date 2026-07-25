import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { businessApi } from "@/features/business/api/businessApi"

export function useBusinesses() {
  return useQuery({
    queryKey: queryKeys.business.list(),
    queryFn: () => businessApi.list(),
  })
}
