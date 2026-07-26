import { Controller, type UseFormReturn } from "react-hook-form"

import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BusinessOnboardingInput } from "@/features/business-onboarding/schemas/businessOnboardingSchema"

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Istanbul",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Australia/Sydney",
]

export function BusinessContactStep({ form }: { form: UseFormReturn<BusinessOnboardingInput> }) {
  const {
    register,
    control,
    formState: { errors },
  } = form

  return (
    <FieldGroup>
      <Field data-invalid={!!errors.address}>
        <FieldLabel required htmlFor="onboarding-address">Address</FieldLabel>
        <Input id="onboarding-address" {...register("address")} />
        <FieldError errors={[errors.address]} />
      </Field>
      <Field data-invalid={!!errors.phone}>
        <FieldLabel required htmlFor="onboarding-phone">Phone</FieldLabel>
        <Input id="onboarding-phone" type="tel" {...register("phone")} />
        <FieldError errors={[errors.phone]} />
      </Field>
      <Field data-invalid={!!errors.email}>
        <FieldLabel required htmlFor="onboarding-email">Contact email</FieldLabel>
        <Input id="onboarding-email" type="email" {...register("email")} />
        <FieldError errors={[errors.email]} />
      </Field>
      <Field data-invalid={!!errors.timezone}>
        <FieldLabel required htmlFor="onboarding-timezone">Timezone</FieldLabel>
        <Controller
          control={control}
          name="timezone"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="onboarding-timezone" className="w-full">
                <SelectValue placeholder="Select a timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((timezone) => (
                  <SelectItem key={timezone} value={timezone}>
                    {timezone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError errors={[errors.timezone]} />
      </Field>
    </FieldGroup>
  )
}
