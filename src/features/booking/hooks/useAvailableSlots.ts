import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/queryKeys"
import { slotsApi, type SlotStatus } from "@/features/booking/api/slotsApi"
import { fromDateKey, toDateKey } from "@/features/booking/lib/slotUtils"
import { businessToday } from "@/lib/datetime"
import { useAuthStore } from "@/stores/authStore"
import type { BusinessRef, Service } from "@/types"

/** How far ahead to look for a day with openings before giving up (the backend's maximum). */
const SLOT_SEARCH_DAYS = 30

export type SlotOption = {
  time: string
  staffId: string | null
  status: SlotStatus
}

/**
 * One request covers the whole search window, so it answers "what's open?" for any
 * day the picker shows as well as "which day opens first?".
 */
function useSlotWindow(business: BusinessRef, service: Service | undefined) {
  const viewerId = useAuthStore((state) => state.actorId)
  const [range] = useState(() => {
    const from = businessToday()
    const to = new Date(from)
    to.setDate(from.getDate() + SLOT_SEARCH_DAYS - 1)
    return { from: toDateKey(from), to: toDateKey(to) }
  })

  return useQuery({
    queryKey: queryKeys.slots.range(business.id, service?.id ?? "", range.from, viewerId),
    enabled: Boolean(service),
    queryFn: () => slotsApi.list(business, service!, range.from, range.to),
  })
}

export function useAvailableSlots(business: BusinessRef, service: Service | undefined, date: Date) {
  const { data, isLoading } = useSlotWindow(business, service)

  const slots = useMemo<SlotOption[] | undefined>(() => {
    if (!data) return undefined
    const dateKey = toDateKey(date)
    return data
      .filter((slot) => slot.date === dateKey)
      .map((slot) => ({ time: slot.time, staffId: slot.staffId, status: slot.status }))
  }, [data, date])

  return { data: slots, isLoading }
}

/** Days in the search window that have at least one open slot, as date keys. */
export function useAvailableDates(business: BusinessRef, service: Service | undefined) {
  const { data, isLoading } = useSlotWindow(business, service)

  const dates = useMemo(
    () =>
      data
        ? new Set(data.filter((slot) => slot.status === "available").map((slot) => slot.date))
        : undefined,
    [data],
  )

  return { data: dates, isLoading }
}

/**
 * First day from today with at least one open slot, so the picker doesn't land
 * on an empty day. `null` once the search window is exhausted.
 */
export function useNextAvailableDate(business: BusinessRef, service: Service | undefined) {
  const { data, isLoading } = useSlotWindow(business, service)

  const nextDate = useMemo(() => {
    if (!data) return undefined
    const first = data.find((slot) => slot.status === "available")
    return first ? fromDateKey(first.date) : null
  }, [data])

  return { data: nextDate, isLoading }
}
