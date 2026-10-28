import type { TFunction } from "i18next"
import { z } from "zod"

import { MOBILE_PHONE_PATTERN } from "@/lib/phone"

export function createStaffFormSchema(t: TFunction) {
  return z.object({
    name: z.string().min(1, t("staff.validation.nameRequired")),
    email: z.email(t("validation.email")),
    phone: z.union([z.literal(""), z.string().regex(MOBILE_PHONE_PATTERN, t("validation.mobilePhone"))]),
    colorTag: z.string().min(1, t("staff.validation.colorRequired")),
    serviceIds: z.array(z.string()),
  })
}

export type StaffFormInput = z.infer<ReturnType<typeof createStaffFormSchema>>
