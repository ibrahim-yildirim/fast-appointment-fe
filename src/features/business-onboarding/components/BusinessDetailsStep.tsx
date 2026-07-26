import { useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { BusinessOnboardingInput } from "@/features/business-onboarding/schemas/businessOnboardingSchema"
import { slugify } from "@/lib/slugify"

export function BusinessDetailsStep({ form }: { form: UseFormReturn<BusinessOnboardingInput> }) {
  const { t } = useTranslation()
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form
  const [slugTouched, setSlugTouched] = useState(false)
  const name = watch("name")

  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(name ?? ""), { shouldValidate: false })
    }
  }, [name, slugTouched, setValue])

  return (
    <FieldGroup>
      <Field data-invalid={!!errors.name}>
        <FieldLabel required htmlFor="onboarding-name">
          {t("onboarding.businessName")}
        </FieldLabel>
        <Input id="onboarding-name" {...register("name")} />
        <FieldError errors={[errors.name]} />
      </Field>
      <Field data-invalid={!!errors.slug}>
        <FieldLabel required htmlFor="onboarding-slug">
          {t("onboarding.bookingUrl")}
        </FieldLabel>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>fast-appointment.com/</span>
          <Input
            id="onboarding-slug"
            {...register("slug", { onChange: () => setSlugTouched(true) })}
          />
        </div>
        <FieldError errors={[errors.slug]} />
      </Field>
      <Field data-invalid={!!errors.description}>
        <FieldLabel required htmlFor="onboarding-description">
          {t("onboarding.description")}
        </FieldLabel>
        <Textarea id="onboarding-description" rows={3} {...register("description")} />
        <FieldError errors={[errors.description]} />
      </Field>
    </FieldGroup>
  )
}
