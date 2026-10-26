import { wallClockToInstant } from "@/lib/datetime"

export type CalendarEvent = {
  title: string
  details: string
  location: string
  /** Stored wall-clock strings (`...Z` meaning Istanbul time). */
  startsAt: string
  endsAt: string
}

/** `20261027T150000Z`, the UTC form both Google Calendar and iCalendar accept. */
function toUtcStamp(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
}

export function googleCalendarUrl(event: CalendarEvent) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toUtcStamp(wallClockToInstant(event.startsAt))}/${toUtcStamp(wallClockToInstant(event.endsAt))}`,
    details: event.details,
    location: event.location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
