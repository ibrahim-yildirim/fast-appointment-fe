import type { Weekday } from "@/types/staff"

export type BusinessHours = {
  day: Weekday
  enabled: boolean
  start: string
  end: string
}

export type Business = {
  id: string
  slug: string
  name: string
  description: string
  timezone: string
  address: string
  phone: string
  email: string
  defaultHours: BusinessHours[]
  createdAt: string
}

/** Public lists are addressed by slug, while cache keys and owner calls use the id. */
export type BusinessRef = Pick<Business, "id" | "slug">
