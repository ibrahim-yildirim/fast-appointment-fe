import { z } from "zod"

export const guestBookingSchema = z.object({
  guestName: z.string().min(1, "Name is required."),
  guestPhone: z
    .string()
    .min(6, "Enter a valid phone number.")
    .regex(/^[0-9+()\s-]+$/, "Enter a valid phone number."),
  // Optional: empty string is allowed, anything else must look like an email.
  guestEmail: z.union([z.literal(""), z.email("Enter a valid email address.")]),
})

export type GuestBookingInput = z.infer<typeof guestBookingSchema>
