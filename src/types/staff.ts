export type Staff = {
  id: string
  businessId: string
  name: string
  email: string
  colorTag: string
  serviceIds: string[]
}

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export type TimeRange = {
  start: string
  end: string
}

export type DayAvailability = {
  day: Weekday
  enabled: boolean
  ranges: TimeRange[]
}

export type StaffAvailability = {
  staffId: string
  weekly: DayAvailability[]
}

export type TimeOffException = {
  id: string
  staffId: string
  date: string
  reason: string
}
