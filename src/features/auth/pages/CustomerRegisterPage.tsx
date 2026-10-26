import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useCustomerAuth } from "@/features/auth/hooks/useCustomerAuth"
import {
  createCustomerRegisterSchema,
  type CustomerRegisterInput,
} from "@/features/auth/schemas/customerAuthSchemas"

export function CustomerRegisterPage() {
  const { t } = useTranslation()
  const { register: registerCustomer } = useCustomerAuth()
  const schema = useMemo(() => createCustomerRegisterSchema(t), [t])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerRegisterInput>({ resolver: zodResolver(schema) })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("auth.customerRegisterTitle")}</CardTitle>
        <CardDescription>{t("auth.customerRegisterSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((values) => registerCustomer.mutate(values))}>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel required htmlFor="customer-register-name">
                {t("auth.name")}
              </FieldLabel>
              <Input id="customer-register-name" autoComplete="name" {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel required htmlFor="customer-register-email">
                {t("auth.email")}
              </FieldLabel>
              <Input
                id="customer-register-email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.phone}>
              <FieldLabel required htmlFor="customer-register-phone">
                {t("auth.phone")}
              </FieldLabel>
              <Input
                id="customer-register-phone"
                type="tel"
                autoComplete="tel"
                {...register("phone")}
              />
              <FieldError errors={[errors.phone]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel required htmlFor="customer-register-password">
                {t("auth.password")}
              </FieldLabel>
              <Input
                id="customer-register-password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel required htmlFor="customer-register-confirm-password">
                {t("auth.confirmPassword")}
              </FieldLabel>
              <Input
                id="customer-register-confirm-password"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              <FieldError errors={[errors.confirmPassword]} />
            </Field>
            <Button type="submit" disabled={registerCustomer.isPending}>
              {registerCustomer.isPending ? t("auth.creatingAccount") : t("auth.createAccount")}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="text-foreground underline underline-offset-4">
            {t("auth.logIn")}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
