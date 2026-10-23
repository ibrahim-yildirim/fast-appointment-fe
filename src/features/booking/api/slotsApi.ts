import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toHourMinute, toId } from "@/api/mappers"
import { fixtureSlots } from "@/features/booking/lib/fixtureSlots"
import type { BusinessRef, Service } from "@/types"

/** booked: no staff free. customerBusy: the logged-in customer has another booking then. */
export type SlotStatus = "available" | "booked" | "customerBusy"

export type Slot = {
  date: string
  time: string
  staffId: string | null
  status: SlotStatus
}

type SlotResponse = {
  date: string
  time: string
  staffId: number | null
  status: "AVAILABLE" | "BOOKED" | "CUSTOMER_BUSY"
}

const toSlotStatus = {
  AVAILABLE: "available",
  BOOKED: "booked",
  CUSTOMER_BUSY: "customerBusy",
} as const satisfies Record<SlotResponse["status"], SlotStatus>

export const slotsApi = {
  /** Start times between two date keys (inclusive), free or not; the backend allows up to 30 days. */
  list: async (
    business: BusinessRef,
    service: Service,
    from: string,
    to: string,
  ): Promise<Slot[]> => {
    if (USE_FIXTURES) {
      return fixtureSlots(business, service, from, to)
    }
    const response = await apiClient.get<SlotResponse[]>(
      endpoints.services.slots(business.slug, service.id, from, to),
    )
    return response.map((slot) => ({
      date: slot.date,
      time: toHourMinute(slot.time),
      staffId: slot.staffId === null ? null : toId(slot.staffId),
      status: toSlotStatus[slot.status],
    }))
  },
}
