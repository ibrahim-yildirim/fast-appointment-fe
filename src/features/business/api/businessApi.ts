import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toBackendDay, toHourMinute, toId, toWeekday, type BackendDay } from "@/api/mappers"
import { ApiError } from "@/api/types"
import { businesses } from "@/fixtures"
import type { Business, BusinessHours } from "@/types"

export type UpdateBusinessInput = Pick<
  Business,
  "name" | "description" | "timezone" | "address" | "city" | "phone" | "email"
> & { hours: BusinessHours[] }

export type BusinessResponse = Omit<Business, "id" | "defaultHours"> & {
  id: number
  defaultHours: { day: BackendDay; enabled: boolean; start: string | null; end: string | null }[]
}

export function toBusiness(response: BusinessResponse): Business {
  return {
    ...response,
    id: toId(response.id),
    defaultHours: response.defaultHours.map((hours) => ({
      day: toWeekday(hours.day),
      enabled: hours.enabled,
      start: toHourMinute(hours.start),
      end: toHourMinute(hours.end),
    })),
  }
}

export const businessApi = {
  list: async (): Promise<Business[]> => {
    if (USE_FIXTURES) {
      return businesses
    }
    const response = await apiClient.get<BusinessResponse[]>(endpoints.businesses.list())
    return response.map(toBusiness)
  },

  // The slug is not part of the update: shared booking links must keep working.
  update: async (businessId: string, input: UpdateBusinessInput): Promise<Business> => {
    if (USE_FIXTURES) {
      const business = businesses.find((candidate) => candidate.id === businessId)
      if (!business) throw new Error("errors.generic")
      Object.assign(business, input, { defaultHours: input.hours })
      return business
    }
    const response = await apiClient.put<BusinessResponse>(endpoints.businesses.ownerUpdate(), {
      ...input,
      hours: input.hours.map((hours) => ({ ...hours, day: toBackendDay(hours.day) })),
    })
    return toBusiness(response)
  },

  getBySlug: async (slug: string): Promise<Business | undefined> => {
    if (USE_FIXTURES) {
      return businesses.find((business) => business.slug === slug)
    }
    try {
      return toBusiness(await apiClient.get<BusinessResponse>(endpoints.businesses.bySlug(slug)))
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return undefined
      throw error
    }
  },
}
