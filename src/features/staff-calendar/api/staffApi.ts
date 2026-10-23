import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toBackendId, toId } from "@/api/mappers"
import type { StaffFormInput } from "@/features/staff-calendar/schemas/staffFormSchema"
import { staff } from "@/fixtures"
import type { BusinessRef, Staff } from "@/types"

type PublicStaffResponse = {
  id: number
  name: string
  colorTag: string
}

type StaffResponse = PublicStaffResponse & {
  businessId: number
  email: string
  active: boolean
  serviceIds: number[]
}

// The public list leaves out email on purpose, and only lists active staff.
function toPublicStaff(response: PublicStaffResponse, businessId: string): Staff {
  return {
    ...response,
    id: toId(response.id),
    businessId,
    email: "",
    serviceIds: [],
    active: true,
  }
}

function toStaff(response: StaffResponse): Staff {
  return {
    ...response,
    id: toId(response.id),
    businessId: toId(response.businessId),
    serviceIds: response.serviceIds.map(toId),
  }
}

function toStaffRequest(input: StaffFormInput) {
  return { ...input, serviceIds: input.serviceIds.map(toBackendId) }
}

export const staffApi = {
  list: async (business: BusinessRef): Promise<Staff[]> => {
    if (USE_FIXTURES) {
      return staff.filter((member) => member.businessId === business.id && member.active)
    }
    const response = await apiClient.get<PublicStaffResponse[]>(endpoints.staff.list(business.slug))
    return response.map((member) => toPublicStaff(member, business.id))
  },

  // The backend has no public single-staff endpoint, so this reads from the list.
  byId: async (business: BusinessRef, staffId: string): Promise<Staff | null> => {
    const all = await staffApi.list(business)
    return all.find((member) => member.id === staffId) ?? null
  },

  /** The owner's own staff with email and services, inactive ones included. */
  listForOwner: async (businessId: string): Promise<Staff[]> => {
    if (USE_FIXTURES) {
      return staff.filter((member) => member.businessId === businessId)
    }
    const response = await apiClient.get<StaffResponse[]>(endpoints.staff.ownerList())
    return response.map(toStaff)
  },

  create: async (businessId: string, input: StaffFormInput): Promise<Staff> => {
    if (USE_FIXTURES) {
      const member: Staff = { id: `staff-${Date.now()}`, businessId, active: true, ...input }
      staff.push(member)
      return member
    }
    const response = await apiClient.post<StaffResponse>(
      endpoints.staff.create(),
      toStaffRequest(input),
    )
    return toStaff(response)
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
    const response = await apiClient.put<StaffResponse>(
      endpoints.staff.byId(staffId),
      toStaffRequest(input),
    )
    return toStaff(response)
  },

  // Bookings keep pointing at a staff member, so "delete" only deactivates them.
  remove: async (businessId: string, staffId: string): Promise<void> => {
    if (USE_FIXTURES) {
      const member = staff.find(
        (candidate) => candidate.businessId === businessId && candidate.id === staffId,
      )
      if (member) member.active = false
      return
    }
    return apiClient.delete<void>(endpoints.staff.byId(staffId))
  },
}
