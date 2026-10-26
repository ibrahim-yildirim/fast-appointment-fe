import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toBackendDay } from "@/api/mappers"
import type { BusinessOnboardingInput } from "@/features/business-onboarding/schemas/businessOnboardingSchema"
import { toBusiness, type BusinessResponse } from "@/features/business/api/businessApi"
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
        city: input.city,
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
    const response = await apiClient.post<BusinessResponse>(endpoints.businesses.create(), {
      ...input,
      hours: input.hours.map((hours) => ({ ...hours, day: toBackendDay(hours.day) })),
    })
    return toBusiness(response)
  },
}
