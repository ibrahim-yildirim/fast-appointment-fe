import type { TFunction } from "i18next"
import { z } from "zod"

export function createBusinessLoginSchema(t: TFunction) {
  return z.object({
    email: z.email(t("validation.email")),
    password: z.string().min(1, t("validation.passwordRequired")),
  })
}

export type BusinessLoginInput = z.infer<ReturnType<typeof createBusinessLoginSchema>>

export function createBusinessRegisterSchema(t: TFunction) {
  return z
    .object({
      name: z.string().min(1, t("validation.nameRequired")),
      email: z.email(t("validation.email")),
      password: z.string().min(8, t("validation.passwordLength")),
      confirmPassword: z.string().min(1, t("validation.confirmPassword")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsMismatch"),
      path: ["confirmPassword"],
    })
}

export type BusinessRegisterInput = z.infer<ReturnType<typeof createBusinessRegisterSchema>>
