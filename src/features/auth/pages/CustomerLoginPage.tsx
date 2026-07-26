import { zodResolver } from "@hookform/resolvers/zod"
import { Search } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useCustomerAuth } from "@/features/auth/hooks/useCustomerAuth"
import {
  customerLoginSchema,
  type CustomerLoginInput,
} from "@/features/auth/schemas/customerAuthSchemas"
import { useAuthStore } from "@/stores/authStore"

export function CustomerLoginPage() {
  const { login } = useCustomerAuth()
  const navigate = useNavigate()
  const clearSession = useAuthStore((state) => state.clearSession)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerLoginInput>({ resolver: zodResolver(customerLoginSchema) })

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Book and manage appointments across businesses.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((values) => login.mutate(values))}>
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel required htmlFor="customer-login-email">Email</FieldLabel>
                <Input
                  id="customer-login-email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field data-invalid={!!errors.password}>
                <FieldLabel required htmlFor="customer-login-password">Password</FieldLabel>
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
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={() => {
              clearSession()
              navigate("/businesses")
            }}
          >
            Log in as a guest
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
            Booked as a guest?
          </CardTitle>
          <CardDescription>
            Find, view, or cancel your appointment with your booking reference — no account needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/booking-lookup">Find my booking</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
