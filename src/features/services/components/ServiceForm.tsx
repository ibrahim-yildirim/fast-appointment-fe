import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { formatDurationLabel, serviceDurationOptions } from "@/features/services/lib/durations"
import {
  serviceFormSchema,
  type ServiceFormInput,
} from "@/features/services/schemas/serviceFormSchema"
import type { Staff } from "@/types"

export function ServiceForm({
  defaultValues,
  staff,
  onSubmit,
  isSubmitting,
  submitLabel,
}: {
  defaultValues?: Partial<ServiceFormInput>
  staff: Staff[]
  onSubmit: (values: ServiceFormInput) => void
  isSubmitting: boolean
  submitLabel: string
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormInput>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      durationMinutes: 30,
      price: 0,
      active: true,
      eligibleStaffIds: [],
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel required htmlFor="service-name">Name</FieldLabel>
          <Input id="service-name" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={!!errors.description}>
          <FieldLabel required htmlFor="service-description">Description</FieldLabel>
          <Textarea id="service-description" rows={3} {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>
        <div className="flex gap-4">
          <Field data-invalid={!!errors.durationMinutes} className="flex-1">
            <FieldLabel required htmlFor="service-duration">Duration</FieldLabel>
            <Controller
              control={control}
              name="durationMinutes"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger id="service-duration" className="w-full">
                    <SelectValue placeholder="Select a duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceDurationOptions.map((minutes) => (
                      <SelectItem key={minutes} value={String(minutes)}>
                        {formatDurationLabel(minutes)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.durationMinutes]} />
          </Field>
          <Field data-invalid={!!errors.price} className="flex-1">
            <FieldLabel required htmlFor="service-price">Price ($)</FieldLabel>
            <Input
              id="service-price"
              type="number"
              min={0}
              step={0.01}
              {...register("price", { valueAsNumber: true })}
            />
            <FieldError errors={[errors.price]} />
          </Field>
        </div>
        <Field orientation="horizontal">
          <FieldLabel htmlFor="service-active">Active</FieldLabel>
          <Controller
            control={control}
            name="active"
            render={({ field }) => (
              <Switch
                id="service-active"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </Field>
        <Field data-invalid={!!errors.eligibleStaffIds}>
          <FieldLabel required>Eligible staff</FieldLabel>
          <Controller
            control={control}
            name="eligibleStaffIds"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                {staff.map((member) => {
                  const checked = field.value.includes(member.id)
                  return (
                    <label
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      {member.name}
                      <Switch
                        checked={checked}
                        onCheckedChange={(value) =>
                          field.onChange(
                            value
                              ? [...field.value, member.id]
                              : field.value.filter((id) => id !== member.id),
                          )
                        }
                      />
                    </label>
                  )
                })}
              </div>
            )}
          />
          <FieldError errors={[errors.eligibleStaffIds]} />
        </Field>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
