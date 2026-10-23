import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toId } from "@/api/mappers"
import type { ServiceFormInput } from "@/features/services/schemas/serviceFormSchema"
import { services } from "@/fixtures"
import type { BusinessRef, Service } from "@/types"

type ServiceOfferingResponse = {
  id: number
  businessId: number
  name: string
  description: string | null
  durationMinutes: number
  price: number
  active: boolean
}

// Staff eligibility isn't modelled in the backend yet (phase 4), so it starts empty.
function toService(response: ServiceOfferingResponse): Service {
  return {
    ...response,
    id: toId(response.id),
    businessId: toId(response.businessId),
    description: response.description ?? "",
    eligibleStaffIds: [],
  }
}

export const servicesApi = {
  list: async (business: BusinessRef): Promise<Service[]> => {
    if (USE_FIXTURES) {
      return services.filter((service) => service.businessId === business.id)
    }
    const response = await apiClient.get<ServiceOfferingResponse[]>(
      endpoints.services.list(business.slug),
    )
    return response.map(toService)
  },

  // The backend has no public single-service endpoint, so this reads from the list.
  byId: async (business: BusinessRef, serviceId: string): Promise<Service | null> => {
    const all = await servicesApi.list(business)
    return all.find((service) => service.id === serviceId) ?? null
  },

  create: async (businessId: string, input: ServiceFormInput): Promise<Service> => {
    if (USE_FIXTURES) {
      const service: Service = { id: `svc-${Date.now()}`, businessId, ...input }
      services.push(service)
      return service
    }
    return apiClient.post<Service>(endpoints.services.list(businessId), input)
  },

  update: async (
    businessId: string,
    serviceId: string,
    input: ServiceFormInput,
  ): Promise<Service> => {
    if (USE_FIXTURES) {
      const index = services.findIndex(
        (service) => service.businessId === businessId && service.id === serviceId,
      )
      if (index === -1) throw new Error("errors.serviceNotFound")
      const updated: Service = { ...services[index], ...input }
      services[index] = updated
      return updated
    }
    return apiClient.put<Service>(endpoints.services.byId(businessId, serviceId), input)
  },

  remove: async (businessId: string, serviceId: string): Promise<void> => {
    if (USE_FIXTURES) {
      const index = services.findIndex(
        (service) => service.businessId === businessId && service.id === serviceId,
      )
      if (index !== -1) services.splice(index, 1)
      return
    }
    return apiClient.delete<void>(endpoints.services.byId(businessId, serviceId))
  },
}
