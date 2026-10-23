import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toHourMinute, toId } from "@/api/mappers"
import { fixtureSlots } from "@/features/booking/lib/fixtureSlots"
import type { BusinessRef, Service } from "@/types"

export type AvailableSlot = {
  date: string
  time: string
  staffId: string
}

type SlotResponse = {
  date: string
  time: string
  staffId: number
}

export const slotsApi = {
  /** Free start times between two date keys (inclusive); the backend allows up to 60 days. */
  list: async (
    business: BusinessRef,
    service: Service,
    from: string,
    to: string,
  ): Promise<AvailableSlot[]> => {
    if (USE_FIXTURES) {
      return fixtureSlots(business, service, from, to)
    }
    const response = await apiClient.get<SlotResponse[]>(
      endpoints.services.slots(business.slug, service.id, from, to),
    )
    return response.map((slot) => ({
      date: slot.date,
      time: toHourMinute(slot.time),
      staffId: toId(slot.staffId),
    }))
  },
}
