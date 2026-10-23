import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useCustomerAuth } from "@/features/auth/hooks/useCustomerAuth"
import {
  createCustomerLoginSchema,
  type CustomerLoginInput,
} from "@/features/auth/schemas/customerAuthSchemas"
import { useAuthStore } from "@/stores/authStore"

export function CustomerLoginPage() {
  const { t } = useTranslation()
  const { login } = useCustomerAuth()
  const navigate = useNavigate()
  const clearSession = useAuthStore((state) => state.clearSession)
  const schema = useMemo(() => createCustomerLoginSchema(t), [t])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerLoginInput>({ resolver: zodResolver(schema) })

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("auth.customerLoginTitle")}</CardTitle>
          <CardDescription>{t("auth.customerLoginSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((values) => login.mutate(values))}>
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel required htmlFor="customer-login-email">
                  {t("auth.email")}
                </FieldLabel>
                <Input
                  id="customer-login-email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field data-invalid={!!errors.password}>
                <FieldLabel required htmlFor="customer-login-password">
                  {t("auth.password")}
                </FieldLabel>
                <Input
                  id="customer-login-password"
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
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="text-foreground underline underline-offset-4">
              {t("auth.register")}
            </Link>
          </p>
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={() => {
              clearSession()
              navigate("/businesses")
            }}
          >
            {t("auth.continueAsGuest")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
