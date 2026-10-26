import type { TFunction } from "i18next"
import { z } from "zod"

export function createCustomerLoginSchema(t: TFunction) {
  return z.object({
    email: z.email(t("validation.email")),
    password: z.string().min(1, t("validation.passwordRequired")),
  })
}

export type CustomerLoginInput = z.infer<ReturnType<typeof createCustomerLoginSchema>>

export function createCustomerRegisterSchema(t: TFunction) {
  return z
    .object({
      name: z.string().min(1, t("validation.nameRequired")),
      email: z.email(t("validation.email")),
      phone: z
        .string()
        .trim()
        .min(6, t("validation.phoneRequired"))
        .max(32, t("validation.phoneRequired"))
        .regex(/^[0-9+()\s-]+$/, t("validation.phoneRequired")),
      password: z.string().min(8, t("validation.passwordLength")),
      confirmPassword: z.string().min(1, t("validation.confirmPassword")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsMismatch"),
      path: ["confirmPassword"],
    })
}

export type CustomerRegisterInput = z.infer<ReturnType<typeof createCustomerRegisterSchema>>
