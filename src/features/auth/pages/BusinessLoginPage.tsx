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
  createBusinessLoginSchema,
  type BusinessLoginInput,
} from "@/features/auth/schemas/businessAuthSchemas"

export function BusinessLoginPage() {
  const { t } = useTranslation()
  const { login } = useBusinessAuth()
  const schema = useMemo(() => createBusinessLoginSchema(t), [t])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessLoginInput>({ resolver: zodResolver(schema) })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("auth.businessLoginTitle")}</CardTitle>
        <CardDescription>{t("auth.businessLoginSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((values) => login.mutate(values))}>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel required htmlFor="business-login-email">
                {t("auth.email")}
              </FieldLabel>
              <Input
                id="business-login-email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel required htmlFor="business-login-password">
                {t("auth.password")}
              </FieldLabel>
              <Input
                id="business-login-password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>
            <Button type="submit" disabled={login.isPending}>
              {login.isPending ? t("auth.loggingIn") : t("auth.logIn")}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("auth.newBusiness")}{" "}
          <Link to="/business/register" className="text-foreground underline underline-offset-4">
            {t("auth.register")}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
