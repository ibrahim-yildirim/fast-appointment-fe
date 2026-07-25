import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import type { BusinessOnboardingInput } from "@/features/business-onboarding/schemas/businessOnboardingSchema"
import { businesses, businessOwners } from "@/fixtures"
import type { Business } from "@/types"

export const onboardingApi = {
  createBusiness: async (
    input: BusinessOnboardingInput,
    ownerId: string,
  ): Promise<Business> => {
    if (USE_FIXTURES) {
      const business: Business = {
        id: `biz-${Date.now()}`,
        slug: input.slug,
        name: input.name,
        description: input.description,
        timezone: input.timezone,
        address: input.address,
        phone: input.phone,
        email: input.email,
        defaultHours: input.hours,
        createdAt: new Date().toISOString(),
      }
      businesses.push(business)

      const owner = businessOwners.find((candidate) => candidate.id === ownerId)
      if (owner) owner.businessId = business.id

      return business
    }
    return apiClient.post<Business>(endpoints.businesses.create(), { ...input, ownerId })
  },
}
