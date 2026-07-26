import type { TFunction } from "i18next"
import { z } from "zod"

export function createStaffFormSchema(t: TFunction) {
  return z.object({
    name: z.string().min(1, t("staff.validation.nameRequired")),
    email: z.email(t("validation.email")),
    colorTag: z.string().min(1, t("staff.validation.colorRequired")),
    serviceIds: z.array(z.string()),
  })
}

export type StaffFormInput = z.infer<ReturnType<typeof createStaffFormSchema>>
