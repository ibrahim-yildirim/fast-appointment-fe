import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useCustomerAuth } from "@/features/auth/hooks/useCustomerAuth"
import {
  customerRegisterSchema,
  type CustomerRegisterInput,
} from "@/features/auth/schemas/customerAuthSchemas"

export function CustomerRegisterPage() {
  const { register: registerCustomer } = useCustomerAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerRegisterInput>({ resolver: zodResolver(customerRegisterSchema) })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Book appointments with any business on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((values) => registerCustomer.mutate(values))}>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel required htmlFor="customer-register-name">Name</FieldLabel>
              <Input id="customer-register-name" autoComplete="name" {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel required htmlFor="customer-register-email">Email</FieldLabel>
              <Input
                id="customer-register-email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel required htmlFor="customer-register-password">Password</FieldLabel>
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
                Confirm password
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
              {registerCustomer.isPending ? "Creating account..." : "Create account"}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground underline underline-offset-4">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
