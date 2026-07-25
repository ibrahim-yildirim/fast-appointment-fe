import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { businesses } from "@/fixtures"
import type { Business } from "@/types"

export const businessApi = {
  list: async (): Promise<Business[]> => {
    if (USE_FIXTURES) {
      return businesses
    }
    return apiClient.get<Business[]>(endpoints.businesses.list())
  },

  getBySlug: async (slug: string): Promise<Business | undefined> => {
    if (USE_FIXTURES) {
      return businesses.find((business) => business.slug === slug)
    }
    return apiClient.get<Business>(endpoints.businesses.bySlug(slug))
  },
}
