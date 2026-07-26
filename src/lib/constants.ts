export const weekdayOrder = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const

/**
 * Granularity of the public booking grid. Service durations are offered in these
 * steps too, so every service starts and ends on a real slot boundary.
 */
export const SLOT_INTERVAL_MINUTES = 10

export const weekdayLabels: Record<(typeof weekdayOrder)[number], string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
}

export const weekdayShortLabels: Record<(typeof weekdayOrder)[number], string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
}
