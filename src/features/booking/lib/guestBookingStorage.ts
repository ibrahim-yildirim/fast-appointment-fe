const STORAGE_KEY = "fast-appointment-guest-bookings"

/**
 * Guest booking links remembered on this device, newest first. Only a convenience: the link
 * itself is what counts, so private windows or cleared storage just mean an empty list.
 */
export function getSavedGuestBookings(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
    return Array.isArray(parsed) ? parsed.filter((uid) => typeof uid === "string") : []
  } catch {
    return []
  }
}

export function saveGuestBooking(uid: string) {
  write([uid, ...getSavedGuestBookings().filter((saved) => saved !== uid)])
}

export function forgetGuestBooking(uid: string) {
  write(getSavedGuestBookings().filter((saved) => saved !== uid))
}

function write(uids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uids))
  } catch {
    // Storage can be blocked; the booking link still works.
  }
}
