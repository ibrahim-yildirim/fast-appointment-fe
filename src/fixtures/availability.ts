import type { StaffAvailability, TimeOffException } from "@/types"

const weekdayRange = { start: "09:00", end: "17:00" }
const saturdayRange = { start: "10:00", end: "14:00" }

function weeklyMonToFri(includeSaturday: boolean) {
  return [
    { day: "mon" as const, enabled: true, ranges: [weekdayRange] },
    { day: "tue" as const, enabled: true, ranges: [weekdayRange] },
    { day: "wed" as const, enabled: true, ranges: [weekdayRange] },
    { day: "thu" as const, enabled: true, ranges: [weekdayRange] },
    { day: "fri" as const, enabled: true, ranges: [weekdayRange] },
    { day: "sat" as const, enabled: includeSaturday, ranges: includeSaturday ? [saturdayRange] : [] },
    { day: "sun" as const, enabled: false, ranges: [] },
  ]
}

export const staffAvailability: StaffAvailability[] = [
  { staffId: "staff-1", weekly: weeklyMonToFri(true) },
  { staffId: "staff-2", weekly: weeklyMonToFri(false) },
  { staffId: "staff-3", weekly: weeklyMonToFri(false) },
  { staffId: "staff-4", weekly: weeklyMonToFri(true) },
]

export const timeOffExceptions: TimeOffException[] = [
  { id: "off-1", staffId: "staff-1", date: "2026-08-03", reason: "İzin günü" },
  { id: "off-2", staffId: "staff-3", date: "2026-08-10", reason: "Kongre" },
]
