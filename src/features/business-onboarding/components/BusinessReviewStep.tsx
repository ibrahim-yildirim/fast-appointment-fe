import type { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import type { BusinessOnboardingInput } from "@/features/business-onboarding/schemas/businessOnboardingSchema"

export function BusinessReviewStep({ form }: { form: UseFormReturn<BusinessOnboardingInput> }) {
  const { t } = useTranslation()
  const values = form.watch()

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div>
        <div className="font-medium">{values.name}</div>
        <div className="text-muted-foreground">fast-appointment.com/{values.slug}</div>
        <p className="mt-1 text-muted-foreground">{values.description}</p>
      </div>
      <div className="flex flex-col gap-0.5 text-muted-foreground">
        <span>{values.city}</span>
        <span>{values.address}</span>
        <span>{values.phone}</span>
        <span>{values.email}</span>
        <span>{values.timezone}</span>
      </div>
      <div className="flex flex-col gap-1">
        {values.hours?.map((day) => (
          <div key={day.day} className="flex justify-between text-muted-foreground">
            <span>{t(`weekdayShort.${day.day}`)}</span>
            <span>{day.enabled ? `${day.start} - ${day.end}` : t("onboarding.closed")}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
