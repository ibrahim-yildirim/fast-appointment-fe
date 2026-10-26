import type { TFunction } from "i18next"
import { z } from "zod"

export function createOwnerBookingSchema(t: TFunction) {
  return z.object({
    serviceId: z.string().min(1, t("dashboard.form.selectService")),
    staffId: z.string().min(1, t("dashboard.form.selectStaff")),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t("dashboard.form.dateRequired")),
    time: z.string().regex(/^\d{2}:\d{2}$/, t("dashboard.form.timeRequired")),
    customerName: z.string().trim().min(1, t("validation.nameRequired")).max(120),
    customerPhone: z
      .string()
      .min(6, t("validation.phoneRequired"))
      .max(32, t("validation.phoneRequired"))
      .regex(/^[0-9+()\s-]+$/, t("validation.phoneRequired")),
    customerEmail: z.union([z.literal(""), z.email(t("validation.email"))]),
    notes: z.string().max(500),
  })
}

export type OwnerBookingInput = z.infer<ReturnType<typeof createOwnerBookingSchema>>
