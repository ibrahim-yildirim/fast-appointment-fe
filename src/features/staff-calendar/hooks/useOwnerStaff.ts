import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { staffApi } from "@/features/staff-calendar/api/staffApi"

export function useOwnerStaff(businessId: string) {
  return useQuery({
    queryKey: queryKeys.staff.ownerList(businessId),
    queryFn: () => staffApi.listForOwner(businessId),
  })
}
