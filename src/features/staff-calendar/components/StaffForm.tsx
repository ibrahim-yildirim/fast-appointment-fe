import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { staffFormSchema, type StaffFormInput } from "@/features/staff-calendar/schemas/staffFormSchema"
import { cn } from "@/lib/utils"
import type { Service } from "@/types"

const colorOptions = ["#171717", "#404040", "#525252", "#737373", "#a3a3a3", "#d4d4d4"]

export function StaffForm({
  defaultValues,
  services,
  onSubmit,
  isSubmitting,
  submitLabel,
}: {
  defaultValues?: Partial<StaffFormInput>
  services: Service[]
  onSubmit: (values: StaffFormInput) => void
  isSubmitting: boolean
  submitLabel: string
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffFormInput>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      email: "",
      colorTag: colorOptions[0],
      serviceIds: [],
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="staff-name">Name</FieldLabel>
          <Input id="staff-name" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="staff-email">Email</FieldLabel>
          <Input id="staff-email" type="email" {...register("email")} />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field data-invalid={!!errors.colorTag}>
          <FieldLabel>Color tag</FieldLabel>
          <Controller
            control={control}
            name="colorTag"
            render={({ field }) => (
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={color}
                    onClick={() => field.onChange(color)}
                    className={cn(
                      "size-6 rounded-full ring-offset-2 ring-offset-background",
                      field.value === color && "ring-2 ring-ring",
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          />
          <FieldError errors={[errors.colorTag]} />
        </Field>
        <Field>
          <FieldLabel>Assigned services</FieldLabel>
          <Controller
            control={control}
            name="serviceIds"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                {services.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No services yet.</p>
                ) : (
                  services.map((service) => {
                    const checked = field.value.includes(service.id)
                    return (
                      <label
                        key={service.id}
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                      >
                        {service.name}
                        <Switch
                          checked={checked}
                          onCheckedChange={(value) =>
                            field.onChange(
                              value
                                ? [...field.value, service.id]
                                : field.value.filter((id) => id !== service.id),
                            )
                          }
                        />
                      </label>
                    )
                  })
                )}
              </div>
            )}
          />
        </Field>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
