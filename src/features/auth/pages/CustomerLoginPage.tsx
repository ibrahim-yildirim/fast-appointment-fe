import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useCustomerAuth } from "@/features/auth/hooks/useCustomerAuth"
import {
  customerLoginSchema,
  type CustomerLoginInput,
} from "@/features/auth/schemas/customerAuthSchemas"

export function CustomerLoginPage() {
  const { login } = useCustomerAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerLoginInput>({ resolver: zodResolver(customerLoginSchema) })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Book and manage appointments across businesses.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((values) => login.mutate(values))}>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="customer-login-email">Email</FieldLabel>
              <Input
                id="customer-login-email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="customer-login-password">Password</FieldLabel>
              <Input
                id="customer-login-password"
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
          No account?{" "}
          <Link to="/register" className="text-foreground underline underline-offset-4">
            Register
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Booked as a guest?{" "}
          <Link to="/booking-lookup" className="text-foreground underline underline-offset-4">
            Find your booking
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
