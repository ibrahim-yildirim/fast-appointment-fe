import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Navigate, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BusinessContactStep } from "@/features/business-onboarding/components/BusinessContactStep"
import { BusinessDetailsStep } from "@/features/business-onboarding/components/BusinessDetailsStep"
import { BusinessHoursStep } from "@/features/business-onboarding/components/BusinessHoursStep"
import { BusinessReviewStep } from "@/features/business-onboarding/components/BusinessReviewStep"
import { useCreateBusiness } from "@/features/business-onboarding/hooks/useCreateBusiness"
import { useBusinesses } from "@/features/business/hooks/useBusinesses"
import {
  businessContactFields,
  businessDetailsFields,
  businessHoursFields,
  createBusinessOnboardingSchema,
  weekdayOrder,
  type BusinessOnboardingInput,
} from "@/features/business-onboarding/schemas/businessOnboardingSchema"
import { useAuthStore } from "@/stores/authStore"

const stepKeys = ["details", "contact", "hours", "review"] as const

export function OnboardingPage() {
  const { t } = useTranslation()
  const schema = useMemo(() => createBusinessOnboardingSchema(t), [t])
  const navigate = useNavigate()
  const businessId = useAuthStore((state) => state.businessId)
  const [step, setStep] = useState(0)
  const createBusiness = useCreateBusiness()
  const { data: businesses } = useBusinesses()

  const form = useForm<BusinessOnboardingInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      timezone: "Europe/Istanbul",
      hours: weekdayOrder.map((day) => ({
        day,
        enabled: day !== "sat" && day !== "sun",
        start: "09:00",
        end: "17:00",
      })),
    },
  })

  if (businessId) {
    if (!businesses) return null
    const existingBusiness = businesses.find((candidate) => candidate.id === businessId)
    return <Navigate to={existingBusiness ? `/${existingBusiness.slug}/dashboard/bookings` : "/"} replace />
  }

  const isLastStep = step === stepKeys.length - 1

  async function handleNext() {
    const fieldsToValidate =
      step === 0
        ? businessDetailsFields
        : step === 1
          ? businessContactFields
          : businessHoursFields
    const valid = await form.trigger(fieldsToValidate)
    if (valid) setStep((current) => current + 1)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-12">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{t("onboarding.stepCounter", { current: step + 1, total: stepKeys.length })}</span>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          {t("common.cancel")}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t(`onboarding.steps.${stepKeys[step]}.title`)}</CardTitle>
          <CardDescription>{t(`onboarding.steps.${stepKeys[step]}.description`)}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((values) => createBusiness.mutate(values))}
            className="flex flex-col gap-6"
          >
            {step === 0 && <BusinessDetailsStep form={form} />}
            {step === 1 && <BusinessContactStep form={form} />}
            {step === 2 && <BusinessHoursStep form={form} />}
            {step === 3 && <BusinessReviewStep form={form} />}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                disabled={step === 0}
                onClick={() => setStep((current) => current - 1)}
              >
                {t("onboarding.back")}
              </Button>
              {/* Distinct keys: reusing the clicked button as the submit button submits early */}
              {isLastStep ? (
                <Button key="submit" type="submit" disabled={createBusiness.isPending}>
                  {createBusiness.isPending ? t("onboarding.creating") : t("onboarding.finish")}
                </Button>
              ) : (
                <Button key="next" type="button" onClick={handleNext}>
                  {t("onboarding.continue")}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
