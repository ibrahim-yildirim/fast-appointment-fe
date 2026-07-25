import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useBusinessAuth } from "@/features/auth/hooks/useBusinessAuth"
import {
  businessRegisterSchema,
  type BusinessRegisterInput,
} from "@/features/auth/schemas/businessAuthSchemas"

export function BusinessRegisterPage() {
  const { register: registerOwner } = useBusinessAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessRegisterInput>({ resolver: zodResolver(businessRegisterSchema) })

  return (
    <Card>
      <CardHeader>
        <CardTitle>List your business</CardTitle>
        <CardDescription>Create an owner account, then set up your business.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((values) => registerOwner.mutate(values))}>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="business-register-name">Your name</FieldLabel>
              <Input id="business-register-name" autoComplete="name" {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="business-register-email">Email</FieldLabel>
              <Input
                id="business-register-email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="business-register-password">Password</FieldLabel>
              <Input
                id="business-register-password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="business-register-confirm-password">Confirm password</FieldLabel>
              <Input
                id="business-register-confirm-password"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              <FieldError errors={[errors.confirmPassword]} />
            </Field>
            <Button type="submit" disabled={registerOwner.isPending}>
              {registerOwner.isPending ? "Creating account..." : "Continue"}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/business/login" className="text-foreground underline underline-offset-4">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
