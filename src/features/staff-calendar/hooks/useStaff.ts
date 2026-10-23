import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { staffApi } from "@/features/staff-calendar/api/staffApi"
import type { BusinessRef } from "@/types"

export function useStaff(business: BusinessRef) {
  return useQuery({
    queryKey: queryKeys.staff.list(business.id),
    queryFn: () => staffApi.list(business),
  })
}
