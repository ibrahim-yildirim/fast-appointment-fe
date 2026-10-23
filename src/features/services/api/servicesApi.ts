import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toBackendId, toId } from "@/api/mappers"
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
  eligibleStaffIds: number[]
}

function toService(response: ServiceOfferingResponse): Service {
  return {
    ...response,
    id: toId(response.id),
    businessId: toId(response.businessId),
    description: response.description ?? "",
    eligibleStaffIds: response.eligibleStaffIds.map(toId),
  }
}

function toServiceRequest(input: ServiceFormInput) {
  return { ...input, eligibleStaffIds: input.eligibleStaffIds.map(toBackendId) }
}

export const servicesApi = {
  list: async (business: BusinessRef): Promise<Service[]> => {
    if (USE_FIXTURES) {
      return services.filter((service) => service.businessId === business.id && service.active)
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

  /** The owner's own services, inactive ones included. */
  listForOwner: async (businessId: string): Promise<Service[]> => {
    if (USE_FIXTURES) {
      return services.filter((service) => service.businessId === businessId)
    }
    const response = await apiClient.get<ServiceOfferingResponse[]>(endpoints.services.ownerList())
    return response.map(toService)
  },

  create: async (businessId: string, input: ServiceFormInput): Promise<Service> => {
    if (USE_FIXTURES) {
      const service: Service = { id: `svc-${Date.now()}`, businessId, ...input }
      services.push(service)
      return service
    }
    const response = await apiClient.post<ServiceOfferingResponse>(
      endpoints.services.create(),
      toServiceRequest(input),
    )
    return toService(response)
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
    const response = await apiClient.put<ServiceOfferingResponse>(
      endpoints.services.byId(serviceId),
      toServiceRequest(input),
    )
    return toService(response)
  },

  // Bookings keep pointing at a service, so "delete" only deactivates it.
  remove: async (businessId: string, serviceId: string): Promise<void> => {
    if (USE_FIXTURES) {
      const service = services.find(
        (candidate) => candidate.businessId === businessId && candidate.id === serviceId,
      )
      if (service) service.active = false
      return
    }
    return apiClient.delete<void>(endpoints.services.byId(serviceId))
  },
}
