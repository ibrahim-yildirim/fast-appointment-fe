import { z } from "zod"

export const staffFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.email("Enter a valid email address."),
  colorTag: z.string().min(1, "Pick a color."),
  serviceIds: z.array(z.string()),
})

export type StaffFormInput = z.infer<typeof staffFormSchema>
