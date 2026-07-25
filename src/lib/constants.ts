export const weekdayOrder = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const

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
