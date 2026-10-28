import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { PhoneInput } from "@/components/form/PhoneInput"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  createStaffFormSchema,
  type StaffFormInput,
} from "@/features/staff-calendar/schemas/staffFormSchema"
import { toPhoneDigits } from "@/lib/phone"
import { cn } from "@/lib/utils"
import type { Service } from "@/types"

// Mid-tone hues: each keeps at least 3:1 contrast on both the ivory and the dark background.
const colorOptions = [
  "#2f7d6d",
  "#4a6fa5",
  "#b0563b",
  "#8a6d1f",
  "#8b5aa8",
  "#b3476b",
  "#5f7f2e",
  "#6b7280",
]

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
  const { t } = useTranslation()
  const schema = useMemo(() => createStaffFormSchema(t), [t])
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      colorTag: colorOptions[0],
      serviceIds: [],
      ...defaultValues,
      phone: toPhoneDigits(defaultValues?.phone),
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel required htmlFor="staff-name">
            {t("staff.name")}
          </FieldLabel>
          <Input id="staff-name" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={!!errors.email}>
          <FieldLabel required htmlFor="staff-email">
            {t("staff.email")}
          </FieldLabel>
          <Input id="staff-email" type="email" {...register("email")} />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="staff-phone">{t("staff.phoneOptional")}</FieldLabel>
          <PhoneInput id="staff-phone" {...register("phone")} />
          <FieldDescription>{t("phone.mobileHint")}</FieldDescription>
          <FieldError errors={[errors.phone]} />
        </Field>
        <Field data-invalid={!!errors.colorTag}>
          <FieldLabel required>{t("staff.colorTag")}</FieldLabel>
          <Controller
            control={control}
            name="colorTag"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={color}
                    aria-pressed={field.value === color}
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
          <FieldLabel>{t("staff.assignedServices")}</FieldLabel>
          <Controller
            control={control}
            name="serviceIds"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                {services.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("staff.noServices")}</p>
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
          {isSubmitting ? t("common.saving") : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
