import type { TFunction } from "i18next"
import { z } from "zod"

import { weekdayOrder } from "@/lib/constants"

export function createAvailabilityFormSchema(t: TFunction) {
  const timeRangeSchema = z.object({
    start: z.string().min(1, t("staff.validation.startRequired")),
    end: z.string().min(1, t("staff.validation.endRequired")),
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
        ctx.addIssue({ code: "custom", message: t("staff.validation.rangeRequired"), path: ["ranges"] })
        return
      }

      for (const range of day.ranges) {
        if (range.start >= range.end) {
          ctx.addIssue({
            code: "custom",
            message: t("staff.validation.startBeforeEnd"),
            path: ["ranges"],
          })
          return
        }
      }

      const sorted = [...day.ranges].sort((a, b) => a.start.localeCompare(b.start))
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].start < sorted[i - 1].end) {
          ctx.addIssue({
            code: "custom",
            message: t("staff.validation.rangesOverlap"),
            path: ["ranges"],
          })
          return
        }
      }
    })

  return z.object({ weekly: z.array(dayAvailabilitySchema).length(7) })
}

export type AvailabilityFormInput = z.infer<ReturnType<typeof createAvailabilityFormSchema>>

export function createTimeOffFormSchema(t: TFunction) {
  return z.object({
    date: z.string().min(1, t("staff.validation.dateRequired")),
    reason: z.string().min(1, t("staff.validation.reasonRequired")),
  })
}

export type TimeOffFormInput = z.infer<ReturnType<typeof createTimeOffFormSchema>>
