import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import type { ServiceFormInput } from "@/features/services/schemas/serviceFormSchema"
import { services } from "@/fixtures"
import type { Service } from "@/types"

export const servicesApi = {
  list: async (businessId: string): Promise<Service[]> => {
    if (USE_FIXTURES) {
      return services.filter((service) => service.businessId === businessId)
    }
    return apiClient.get<Service[]>(endpoints.services.list(businessId))
  },

  byId: async (businessId: string, serviceId: string): Promise<Service | undefined> => {
    if (USE_FIXTURES) {
      return services.find(
        (service) => service.businessId === businessId && service.id === serviceId,
      )
    }
    return apiClient.get<Service>(endpoints.services.byId(businessId, serviceId))
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
