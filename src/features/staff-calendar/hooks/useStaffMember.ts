import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { staffApi } from "@/features/staff-calendar/api/staffApi"

export function useStaffMember(businessId: string, staffId: string) {
  return useQuery({
    queryKey: queryKeys.staff.byId(businessId, staffId),
    queryFn: () => staffApi.byId(businessId, staffId),
  })
}
