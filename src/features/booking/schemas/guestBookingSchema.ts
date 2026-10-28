import type { TFunction } from "i18next"
import { z } from "zod"

import { MOBILE_PHONE_PATTERN } from "@/lib/phone"

export function createGuestBookingSchema(t: TFunction) {
  return z.object({
    guestName: z.string().min(1, t("validation.nameRequired")),
    guestPhone: z.string().regex(MOBILE_PHONE_PATTERN, t("validation.mobilePhone")),
    // Optional: empty string is allowed, anything else must look like an email.
    guestEmail: z.union([z.literal(""), z.email(t("validation.email"))]),
  })
}

export type GuestBookingInput = z.infer<ReturnType<typeof createGuestBookingSchema>>
