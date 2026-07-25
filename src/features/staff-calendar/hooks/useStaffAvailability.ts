import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { availabilityApi } from "@/features/staff-calendar/api/availabilityApi"

export function useStaffAvailability(businessId: string, staffId: string) {
  return useQuery({
    queryKey: queryKeys.staff.availability(businessId, staffId),
    queryFn: () => availabilityApi.getWeekly(businessId, staffId),
  })
}
