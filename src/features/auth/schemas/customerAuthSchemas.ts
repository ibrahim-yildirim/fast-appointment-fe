import { z } from "zod"

export const customerLoginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

export type CustomerLoginInput = z.infer<typeof customerLoginSchema>

export const customerRegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required."),
    email: z.email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  })

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>
