import type { Business, BusinessHours } from "@/types"

function weeklyHours(includeSaturday: boolean): BusinessHours[] {
  return [
    { day: "mon", enabled: true, start: "09:00", end: "17:00" },
    { day: "tue", enabled: true, start: "09:00", end: "17:00" },
    { day: "wed", enabled: true, start: "09:00", end: "17:00" },
    { day: "thu", enabled: true, start: "09:00", end: "17:00" },
    { day: "fri", enabled: true, start: "09:00", end: "17:00" },
    { day: "sat", enabled: includeSaturday, start: "10:00", end: "14:00" },
    { day: "sun", enabled: false, start: "09:00", end: "17:00" },
  ]
}

export const businesses: Business[] = [
  {
    id: "biz-1",
    slug: "glow-salon",
    name: "Glow Hair & Beauty Salon",
    description: "Full-service salon offering hair, color, and skin treatments.",
    timezone: "America/New_York",
    address: "128 Maple Street, Springfield",
    phone: "+1-555-0142",
    email: "hello@glowsalon.example",
    defaultHours: weeklyHours(true),
    createdAt: "2026-01-12T09:00:00.000Z",
  },
  {
    id: "biz-2",
    slug: "peak-dental",
    name: "Peak Dental Clinic",
    description: "General and cosmetic dentistry for the whole family.",
    timezone: "America/Chicago",
    address: "44 Summit Ave, Riverton",
    phone: "+1-555-0198",
    email: "contact@peakdental.example",
    defaultHours: weeklyHours(false),
    createdAt: "2026-02-03T09:00:00.000Z",
  },
]
