import type { TFunction } from "i18next"
import { z } from "zod"

export function createGuestBookingSchema(t: TFunction) {
  return z.object({
    guestName: z.string().min(1, t("validation.nameRequired")),
    guestPhone: z
      .string()
      .min(6, t("validation.phoneRequired"))
      .regex(/^[0-9+()\s-]+$/, t("validation.phoneRequired")),
    // Optional: empty string is allowed, anything else must look like an email.
    guestEmail: z.union([z.literal(""), z.email(t("validation.email"))]),
  })
}

export type GuestBookingInput = z.infer<ReturnType<typeof createGuestBookingSchema>>
