import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import type { StaffFormInput } from "@/features/staff-calendar/schemas/staffFormSchema"
import { staff } from "@/fixtures"
import type { Staff } from "@/types"

export const staffApi = {
  list: async (businessId: string): Promise<Staff[]> => {
    if (USE_FIXTURES) {
      return staff.filter((member) => member.businessId === businessId)
    }
    return apiClient.get<Staff[]>(endpoints.staff.list(businessId))
  },

  byId: async (businessId: string, staffId: string): Promise<Staff | undefined> => {
    if (USE_FIXTURES) {
      return staff.find((member) => member.businessId === businessId && member.id === staffId)
    }
    return apiClient.get<Staff>(endpoints.staff.byId(businessId, staffId))
  },

  create: async (businessId: string, input: StaffFormInput): Promise<Staff> => {
    if (USE_FIXTURES) {
      const member: Staff = { id: `staff-${Date.now()}`, businessId, ...input }
      staff.push(member)
      return member
    }
    return apiClient.post<Staff>(endpoints.staff.list(businessId), input)
  },

  update: async (businessId: string, staffId: string, input: StaffFormInput): Promise<Staff> => {
    if (USE_FIXTURES) {
      const index = staff.findIndex(
        (member) => member.businessId === businessId && member.id === staffId,
      )
      if (index === -1) throw new Error("errors.staffNotFound")
      const updated: Staff = { ...staff[index], ...input }
      staff[index] = updated
      return updated
    }
    return apiClient.put<Staff>(endpoints.staff.byId(businessId, staffId), input)
  },

  remove: async (businessId: string, staffId: string): Promise<void> => {
    if (USE_FIXTURES) {
      const index = staff.findIndex(
        (member) => member.businessId === businessId && member.id === staffId,
      )
      if (index !== -1) staff.splice(index, 1)
      return
    }
    return apiClient.delete<void>(endpoints.staff.byId(businessId, staffId))
  },
}
