import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { customersApi } from "@/features/customers/api/customersApi"

export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers.list(),
    queryFn: () => customersApi.list(),
  })
}
