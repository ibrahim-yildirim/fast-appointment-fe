import { z } from "zod"

import { weekdayOrder } from "@/lib/constants"

const timeRangeSchema = z.object({
  start: z.string().min(1, "Start time is required."),
  end: z.string().min(1, "End time is required."),
})

const dayAvailabilitySchema = z
  .object({
    day: z.enum(weekdayOrder),
    enabled: z.boolean(),
    ranges: z.array(timeRangeSchema),
  })
  .superRefine((day, ctx) => {
    if (!day.enabled) return

    if (day.ranges.length === 0) {
      ctx.addIssue({ code: "custom", message: "Add at least one time range.", path: ["ranges"] })
      return
    }

    for (const range of day.ranges) {
      if (range.start >= range.end) {
        ctx.addIssue({
          code: "custom",
          message: "Start time must be before end time.",
          path: ["ranges"],
        })
        return
      }
    }

    const sorted = [...day.ranges].sort((a, b) => a.start.localeCompare(b.start))
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start < sorted[i - 1].end) {
        ctx.addIssue({ code: "custom", message: "Time ranges can't overlap.", path: ["ranges"] })
        return
      }
    }
  })

export const availabilityFormSchema = z.object({
  weekly: z.array(dayAvailabilitySchema).length(7),
})

export type AvailabilityFormInput = z.infer<typeof availabilityFormSchema>

export const timeOffFormSchema = z.object({
  date: z.string().min(1, "Date is required."),
  reason: z.string().min(1, "Reason is required."),
})

export type TimeOffFormInput = z.infer<typeof timeOffFormSchema>
