import { staffAvailability, timeOffExceptions } from "@/fixtures"
import type { DayAvailability, TimeOffException } from "@/types"

export const availabilityApi = {
  getWeekly: async (_businessId: string, staffId: string): Promise<DayAvailability[]> =>
    staffAvailability.find((entry) => entry.staffId === staffId)?.weekly ?? [],

  listTimeOff: async (_businessId: string, staffId: string): Promise<TimeOffException[]> =>
    timeOffExceptions.filter((entry) => entry.staffId === staffId),
}
