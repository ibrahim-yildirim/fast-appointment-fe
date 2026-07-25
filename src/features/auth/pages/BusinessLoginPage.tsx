import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useBusinessAuth } from "@/features/auth/hooks/useBusinessAuth"
import {
  businessLoginSchema,
  type BusinessLoginInput,
} from "@/features/auth/schemas/businessAuthSchemas"

export function BusinessLoginPage() {
  const { login } = useBusinessAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessLoginInput>({ resolver: zodResolver(businessLoginSchema) })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business owner login</CardTitle>
        <CardDescription>Manage your business's services, staff, and bookings.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((values) => login.mutate(values))}>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="business-login-email">Email</FieldLabel>
              <Input
                id="business-login-email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="business-login-password">Password</FieldLabel>
              <Input
                id="business-login-password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>
            <Button type="submit" disabled={login.isPending}>
              {login.isPending ? "Logging in..." : "Log in"}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New business?{" "}
          <Link to="/business/register" className="text-foreground underline underline-offset-4">
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
