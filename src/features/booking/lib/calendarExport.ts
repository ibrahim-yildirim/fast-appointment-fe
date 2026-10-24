import { wallClockToInstant } from "@/lib/datetime"

export type CalendarEvent = {
  id: string
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

// RFC 5545 text values: backslash, comma, semicolon and newlines must be escaped.
function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/([,;])/g, "\\$1")
    .replace(/\r?\n/g, "\\n")
}

export function icsContent(event: CalendarEvent) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fast Appointment//Booking//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:booking-${event.id}@fast-appointment`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(wallClockToInstant(event.startsAt))}`,
    `DTEND:${toUtcStamp(wallClockToInstant(event.endsAt))}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.details)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}

export function downloadIcs(event: CalendarEvent, fileName: string) {
  const url = URL.createObjectURL(new Blob([icsContent(event)], { type: "text/calendar" }))
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
