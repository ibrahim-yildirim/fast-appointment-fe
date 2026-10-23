import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { staffApi } from "@/features/staff-calendar/api/staffApi"
import type { BusinessRef } from "@/types"

export function useStaffMember(business: BusinessRef, staffId: string) {
  return useQuery({
    queryKey: queryKeys.staff.byId(business.id, staffId),
    queryFn: () => staffApi.byId(business, staffId),
    select: (member) => member ?? undefined,
  })
}
