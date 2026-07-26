export const weekdayOrder = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const

/**
 * Granularity of the public booking grid. Service durations are offered in these
 * steps too, so every service starts and ends on a real slot boundary.
 */
export const SLOT_INTERVAL_MINUTES = 10
