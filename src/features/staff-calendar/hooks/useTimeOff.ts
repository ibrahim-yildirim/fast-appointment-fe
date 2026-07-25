import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { availabilityApi } from "@/features/staff-calendar/api/availabilityApi"

export function useTimeOff(businessId: string, staffId: string) {
  return useQuery({
    queryKey: queryKeys.staff.timeOff(businessId, staffId),
    queryFn: () => availabilityApi.listTimeOff(businessId, staffId),
  })
}
