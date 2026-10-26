import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BusinessContactStep } from "@/features/business-onboarding/components/BusinessContactStep"
import { BusinessHoursStep } from "@/features/business-onboarding/components/BusinessHoursStep"
import {
  createBusinessOnboardingSchema,
  weekdayOrder,
  type BusinessOnboardingInput,
} from "@/features/business-onboarding/schemas/businessOnboardingSchema"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useUpdateBusiness } from "@/features/business/hooks/useUpdateBusiness"

export function DashboardSettingsPage() {
  const { t } = useTranslation()
  const business = useBusinessContext()
  const updateBusiness = useUpdateBusiness(business.id)
  const schema = useMemo(() => createBusinessOnboardingSchema(t), [t])

  const form = useForm<BusinessOnboardingInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: business.name,
      slug: business.slug,
      description: business.description,
      address: business.address,
      phone: business.phone,
      email: business.email,
      timezone: business.timezone,
      hours: weekdayOrder.map((day) => {
        const hours = business.defaultHours.find((candidate) => candidate.day === day)
        // Closed days can come back without times; the time inputs still need a value to show.
        return {
          day,
          enabled: hours?.enabled ?? false,
          start: hours?.start || "09:00",
          end: hours?.end || "17:00",
        }
      }),
    },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  function onSubmit(values: BusinessOnboardingInput) {
    updateBusiness.mutate({
      name: values.name,
      description: values.description,
      timezone: values.timezone,
      address: values.address,
      phone: values.phone,
      email: values.email,
      hours: values.hours,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">{t("dashboard.settings")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("onboarding.steps.details.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel required htmlFor="settings-name">
                {t("onboarding.businessName")}
              </FieldLabel>
              <Input id="settings-name" {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="settings-slug">{t("onboarding.bookingUrl")}</FieldLabel>
              <Input id="settings-slug" value={`fast-appointment.com/${business.slug}`} readOnly disabled />
              <p className="text-sm text-muted-foreground">{t("settings.slugFixed")}</p>
            </Field>
            <Field data-invalid={!!errors.description}>
              <FieldLabel required htmlFor="settings-description">
                {t("onboarding.description")}
              </FieldLabel>
              <Textarea id="settings-description" rows={3} {...register("description")} />
              <FieldError errors={[errors.description]} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("onboarding.steps.contact.title")}</CardTitle>
          <CardDescription>{t("onboarding.steps.contact.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <BusinessContactStep form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("onboarding.stepHours")}</CardTitle>
          <CardDescription>{t("settings.hoursHint")}</CardDescription>
        </CardHeader>
        <CardContent>
          <BusinessHoursStep form={form} />
        </CardContent>
      </Card>

      <Button type="submit" className="self-start" disabled={updateBusiness.isPending}>
        {updateBusiness.isPending ? t("common.saving") : t("common.save")}
      </Button>
    </form>
  )
}
