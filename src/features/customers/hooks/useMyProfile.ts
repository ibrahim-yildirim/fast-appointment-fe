import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { customersApi } from "@/features/customers/api/customersApi"

export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.customers.me(),
    queryFn: () => customersApi.me(),
  })
}
