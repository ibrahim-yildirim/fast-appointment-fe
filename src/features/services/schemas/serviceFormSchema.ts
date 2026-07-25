import { z } from "zod"

export const serviceFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().min(1, "Description is required."),
  // Registered with `valueAsNumber`, so an empty field arrives as NaN and fails here.
  durationMinutes: z
    .number("Enter a duration in minutes.")
    .int("Duration must be a whole number.")
    .positive("Duration must be a positive number."),
  price: z.number("Enter a price.").nonnegative("Price can't be negative."),
  active: z.boolean(),
  eligibleStaffIds: z.array(z.string()).min(1, "Select at least one staff member."),
})

export type ServiceFormInput = z.infer<typeof serviceFormSchema>
