import { z } from "zod"

export const serviceFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().min(1, "Description is required."),
  durationMinutes: z.coerce.number().int().positive("Duration must be a positive number."),
  price: z.coerce.number().nonnegative("Price can't be negative."),
  active: z.boolean(),
  eligibleStaffIds: z.array(z.string()).min(1, "Select at least one staff member."),
})

export type ServiceFormInput = z.infer<typeof serviceFormSchema>
