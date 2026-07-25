import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BusinessContactStep } from "@/features/business-onboarding/components/BusinessContactStep"
import { BusinessDetailsStep } from "@/features/business-onboarding/components/BusinessDetailsStep"
import { BusinessHoursStep } from "@/features/business-onboarding/components/BusinessHoursStep"
import { BusinessReviewStep } from "@/features/business-onboarding/components/BusinessReviewStep"
import { useCreateBusiness } from "@/features/business-onboarding/hooks/useCreateBusiness"
import {
  businessContactFields,
  businessDetailsFields,
  businessHoursFields,
  businessOnboardingSchema,
  weekdayOrder,
  type BusinessOnboardingInput,
} from "@/features/business-onboarding/schemas/businessOnboardingSchema"
import { businesses } from "@/fixtures"
import { useAuthStore } from "@/stores/authStore"

const steps = [
  { title: "Business details", description: "What should customers see first?" },
  { title: "Contact & location", description: "How customers and staff reach you." },
  { title: "Default hours", description: "Your typical weekly hours. Staff can override this." },
  { title: "Review", description: "Confirm everything looks right." },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const businessId = useAuthStore((state) => state.businessId)
  const [step, setStep] = useState(0)
  const createBusiness = useCreateBusiness()

  const form = useForm<BusinessOnboardingInput>({
    resolver: zodResolver(businessOnboardingSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      timezone: "America/New_York",
      hours: weekdayOrder.map((day) => ({
        day,
        enabled: day !== "sat" && day !== "sun",
        start: "09:00",
        end: "17:00",
      })),
    },
  })

  if (businessId) {
    const existingBusiness = businesses.find((candidate) => candidate.id === businessId)
    return <Navigate to={existingBusiness ? `/${existingBusiness.slug}/dashboard` : "/"} replace />
  }

  const isLastStep = step === steps.length - 1

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
        <span>
          Step {step + 1} of {steps.length}
        </span>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          Cancel
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{steps[step].title}</CardTitle>
          <CardDescription>{steps[step].description}</CardDescription>
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
                Back
              </Button>
              {isLastStep ? (
                <Button type="submit" disabled={createBusiness.isPending}>
                  {createBusiness.isPending ? "Creating..." : "Create business"}
                </Button>
              ) : (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
