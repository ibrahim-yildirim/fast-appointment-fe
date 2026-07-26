import type { TFunction } from "i18next"
import { z } from "zod"

import { serviceDurationOptions } from "@/features/services/lib/durations"

export function createServiceFormSchema(t: TFunction) {
  return z.object({
    name: z.string().min(1, t("services.validation.nameRequired")),
    description: z.string().min(1, t("services.validation.descriptionRequired")),
    // Backstop for the select: rejects legacy values that predate the 10-minute tiers.
    durationMinutes: z
      .number(t("services.validation.durationRequired"))
      .refine(
        (minutes) => serviceDurationOptions.includes(minutes),
        t("services.validation.durationRequired"),
      ),
    price: z.number(t("services.validation.priceRequired")).nonnegative(t("services.validation.priceNegative")),
    active: z.boolean(),
    eligibleStaffIds: z.array(z.string()).min(1, t("services.validation.staffRequired")),
  })
}

export type ServiceFormInput = z.infer<ReturnType<typeof createServiceFormSchema>>
