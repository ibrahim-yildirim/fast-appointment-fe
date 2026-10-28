import type { TFunction } from "i18next"
import { z } from "zod"

import { weekdayOrder } from "@/lib/constants"
import { BUSINESS_PHONE_PATTERN } from "@/lib/phone"

export { weekdayOrder }

export const HOUR_OPTIONS = Array.from({ length: 48 }, (_, index) =>
  `${String(Math.floor(index / 2)).padStart(2, "0")}:${index % 2 === 0 ? "00" : "30"}`,
)

export function createBusinessOnboardingSchema(t: TFunction) {
  return z.object({
    name: z.string().min(1, t("onboarding.validation.nameRequired")),
    slug: z
      .string()
      .min(1, t("onboarding.validation.slugRequired"))
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, t("onboarding.validation.slugFormat")),
    description: z.string().min(1, t("onboarding.validation.descriptionRequired")),
    address: z.string().min(1, t("onboarding.validation.addressRequired")),
    city: z.string().min(1, t("onboarding.validation.cityRequired")),
    phone: z.string().regex(BUSINESS_PHONE_PATTERN, t("validation.businessPhone")),
    email: z.email(t("validation.email")),
    timezone: z.string().min(1, t("onboarding.validation.timezoneRequired")),
    hours: z
      .array(
        z
          .object({
            day: z.enum(weekdayOrder),
            enabled: z.boolean(),
            start: z.string(),
            end: z.string(),
          })
          .superRefine((day, context) => {
            if (!day.enabled) return
            for (const part of ["start", "end"] as const) {
              if (!HOUR_OPTIONS.includes(day[part])) {
                context.addIssue({ code: "custom", path: [part], message: t("onboarding.validation.hoursStep") })
                return
              }
            }
            if (day.end <= day.start) {
              context.addIssue({ code: "custom", path: ["end"], message: t("onboarding.validation.hoursOrder") })
            }
          }),
      )
      .length(7),
  })
}

export type BusinessOnboardingInput = z.infer<ReturnType<typeof createBusinessOnboardingSchema>>

export const businessDetailsFields = ["name", "slug", "description"] as const
export const businessContactFields = ["city", "address", "phone", "email", "timezone"] as const
export const businessHoursFields = ["hours"] as const
