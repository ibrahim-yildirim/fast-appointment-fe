import { z } from "zod"

import { businesses } from "@/fixtures"
import { weekdayOrder } from "@/lib/constants"

export { weekdayOrder }

export const businessOnboardingSchema = z.object({
  name: z.string().min(1, "Business name is required."),
  slug: z
    .string()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.")
    .refine((slug) => !businesses.some((business) => business.slug === slug), {
      message: "This slug is already taken.",
    }),
  description: z.string().min(1, "Description is required."),
  address: z.string().min(1, "Address is required."),
  phone: z.string().min(1, "Phone number is required."),
  email: z.email("Enter a valid email address."),
  timezone: z.string().min(1, "Timezone is required."),
  hours: z
    .array(
      z.object({
        day: z.enum(weekdayOrder),
        enabled: z.boolean(),
        start: z.string(),
        end: z.string(),
      }),
    )
    .length(7),
})

export type BusinessOnboardingInput = z.infer<typeof businessOnboardingSchema>

export const businessDetailsFields = ["name", "slug", "description"] as const
export const businessContactFields = ["address", "phone", "email", "timezone"] as const
export const businessHoursFields = ["hours"] as const
