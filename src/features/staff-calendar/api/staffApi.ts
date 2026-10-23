import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toId } from "@/api/mappers"
import type { StaffFormInput } from "@/features/staff-calendar/schemas/staffFormSchema"
import { staff } from "@/fixtures"
import type { BusinessRef, Staff } from "@/types"

type PublicStaffResponse = {
  id: number
  name: string
  colorTag: string
}

// The public list leaves out email on purpose; service links arrive in phase 4.
function toStaff(response: PublicStaffResponse, businessId: string): Staff {
  return {
    ...response,
    id: toId(response.id),
    businessId,
    email: "",
    serviceIds: [],
  }
}

export const staffApi = {
  list: async (business: BusinessRef): Promise<Staff[]> => {
    if (USE_FIXTURES) {
      return staff.filter((member) => member.businessId === business.id)
    }
    const response = await apiClient.get<PublicStaffResponse[]>(endpoints.staff.list(business.slug))
    return response.map((member) => toStaff(member, business.id))
  },

  // The backend has no public single-staff endpoint, so this reads from the list.
  byId: async (business: BusinessRef, staffId: string): Promise<Staff | null> => {
    const all = await staffApi.list(business)
    return all.find((member) => member.id === staffId) ?? null
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
