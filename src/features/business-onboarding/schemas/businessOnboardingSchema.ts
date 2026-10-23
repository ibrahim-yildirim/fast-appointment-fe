import type { TFunction } from "i18next"
import { z } from "zod"

import { weekdayOrder } from "@/lib/constants"

export { weekdayOrder }

export function createBusinessOnboardingSchema(t: TFunction) {
  return z.object({
    name: z.string().min(1, t("onboarding.validation.nameRequired")),
    slug: z
      .string()
      .min(1, t("onboarding.validation.slugRequired"))
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, t("onboarding.validation.slugFormat")),
    description: z.string().min(1, t("onboarding.validation.descriptionRequired")),
    address: z.string().min(1, t("onboarding.validation.addressRequired")),
    phone: z.string().min(1, t("onboarding.validation.phoneRequired")),
    email: z.email(t("validation.email")),
    timezone: z.string().min(1, t("onboarding.validation.timezoneRequired")),
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
}

export type BusinessOnboardingInput = z.infer<ReturnType<typeof createBusinessOnboardingSchema>>

export const businessDetailsFields = ["name", "slug", "description"] as const
export const businessContactFields = ["address", "phone", "email", "timezone"] as const
export const businessHoursFields = ["hours"] as const
