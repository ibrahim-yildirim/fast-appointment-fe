import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useBusinessAuth } from "@/features/auth/hooks/useBusinessAuth"
import {
  createBusinessRegisterSchema,
  type BusinessRegisterInput,
} from "@/features/auth/schemas/businessAuthSchemas"

export function BusinessRegisterPage() {
  const { t } = useTranslation()
  const { register: registerBusiness } = useBusinessAuth()
  const schema = useMemo(() => createBusinessRegisterSchema(t), [t])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessRegisterInput>({ resolver: zodResolver(schema) })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("auth.businessRegisterTitle")}</CardTitle>
        <CardDescription>{t("auth.businessRegisterSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((values) => registerBusiness.mutate(values))}>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel required htmlFor="business-register-name">
                {t("auth.yourName")}
              </FieldLabel>
              <Input id="business-register-name" autoComplete="name" {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel required htmlFor="business-register-email">
                {t("auth.email")}
              </FieldLabel>
              <Input
                id="business-register-email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel required htmlFor="business-register-password">
                {t("auth.password")}
              </FieldLabel>
              <Input
                id="business-register-password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel required htmlFor="business-register-confirm-password">
                {t("auth.confirmPassword")}
              </FieldLabel>
              <Input
                id="business-register-confirm-password"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              <FieldError errors={[errors.confirmPassword]} />
            </Field>
            <Button type="submit" disabled={registerBusiness.isPending}>
              {registerBusiness.isPending ? t("auth.creatingAccount") : t("auth.createAccount")}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("auth.haveAccount")}{" "}
          <Link to="/business/login" className="text-foreground underline underline-offset-4">
            {t("auth.logIn")}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
