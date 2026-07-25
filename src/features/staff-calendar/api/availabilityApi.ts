import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import type { TimeOffFormInput } from "@/features/staff-calendar/schemas/availabilityFormSchema"
import { staffAvailability, timeOffExceptions } from "@/fixtures"
import type { DayAvailability, TimeOffException } from "@/types"

export const availabilityApi = {
  getWeekly: async (businessId: string, staffId: string): Promise<DayAvailability[]> => {
    if (USE_FIXTURES) {
      const record = staffAvailability.find((entry) => entry.staffId === staffId)
      return record?.weekly ?? []
    }
    return apiClient.get<DayAvailability[]>(endpoints.staff.availability(businessId, staffId))
  },

  updateWeekly: async (
    businessId: string,
    staffId: string,
    weekly: DayAvailability[],
  ): Promise<DayAvailability[]> => {
    if (USE_FIXTURES) {
      const index = staffAvailability.findIndex((entry) => entry.staffId === staffId)
      if (index === -1) {
        staffAvailability.push({ staffId, weekly })
      } else {
        staffAvailability[index] = { staffId, weekly }
      }
      return weekly
    }
    return apiClient.put<DayAvailability[]>(
      endpoints.staff.availability(businessId, staffId),
      weekly,
    )
  },

  listTimeOff: async (businessId: string, staffId: string): Promise<TimeOffException[]> => {
    if (USE_FIXTURES) {
      return timeOffExceptions.filter((entry) => entry.staffId === staffId)
    }
    return apiClient.get<TimeOffException[]>(endpoints.staff.timeOff(businessId, staffId))
  },

  addTimeOff: async (
    businessId: string,
    staffId: string,
    input: TimeOffFormInput,
  ): Promise<TimeOffException> => {
    if (USE_FIXTURES) {
      const entry: TimeOffException = { id: `off-${Date.now()}`, staffId, ...input }
      timeOffExceptions.push(entry)
      return entry
    }
    return apiClient.post<TimeOffException>(endpoints.staff.timeOff(businessId, staffId), input)
  },

  removeTimeOff: async (
    businessId: string,
    staffId: string,
    timeOffId: string,
  ): Promise<void> => {
    if (USE_FIXTURES) {
      const index = timeOffExceptions.findIndex((entry) => entry.id === timeOffId)
      if (index !== -1) timeOffExceptions.splice(index, 1)
      return
    }
    return apiClient.delete<void>(endpoints.staff.timeOffById(businessId, staffId, timeOffId))
  },
}
