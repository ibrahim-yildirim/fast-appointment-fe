import { z } from "zod"

import { serviceDurationOptions } from "@/features/services/lib/durations"

export const serviceFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().min(1, "Description is required."),
  // Backstop for the select: rejects legacy values that predate the 10-minute tiers.
  durationMinutes: z
    .number("Select a duration.")
    .refine((minutes) => serviceDurationOptions.includes(minutes), "Select a duration."),
  price: z.number("Enter a price.").nonnegative("Price can't be negative."),
  active: z.boolean(),
  eligibleStaffIds: z.array(z.string()).min(1, "Select at least one staff member."),
})

export type ServiceFormInput = z.infer<typeof serviceFormSchema>
