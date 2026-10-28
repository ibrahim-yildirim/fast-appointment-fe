import type { TFunction } from "i18next"
import { z } from "zod"

import { MOBILE_PHONE_PATTERN } from "@/lib/phone"

export function createOwnerBookingSchema(t: TFunction) {
  return z.object({
    serviceId: z.string().min(1, t("dashboard.form.selectService")),
    staffId: z.string().min(1, t("dashboard.form.selectStaff")),
    date: z.string().min(1, t("dashboard.form.dateRequired")),
    time: z.string().min(1, t("dashboard.form.timeRequired")),
    customerName: z.string().trim().min(1, t("validation.nameRequired")).max(120),
    customerPhone: z.string().regex(MOBILE_PHONE_PATTERN, t("validation.mobilePhone")),
    customerEmail: z.union([z.literal(""), z.email(t("validation.email"))]),
    notes: z.string().max(500),
  })
}

export type OwnerBookingInput = z.infer<ReturnType<typeof createOwnerBookingSchema>>
