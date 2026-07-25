import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { staffApi } from "@/features/staff-calendar/api/staffApi"

export function useStaff(businessId: string) {
  return useQuery({
    queryKey: queryKeys.staff.list(businessId),
    queryFn: () => staffApi.list(businessId),
  })
}
