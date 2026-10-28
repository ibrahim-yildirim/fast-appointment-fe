import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Switch } from "@/components/ui/switch"
import {
  HOUR_OPTIONS,
  type BusinessOnboardingInput,
} from "@/features/business-onboarding/schemas/businessOnboardingSchema"
import { BookingTimeField } from "@/features/dashboard-bookings/components/BookingSlotFields"

export function BusinessHoursStep({ form }: { form: UseFormReturn<BusinessOnboardingInput> }) {
  const { t } = useTranslation()
  const {
    control,
    watch,
    formState: { errors },
  } = form
  const { fields } = useFieldArray({ control, name: "hours" })

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => {
        const enabled = watch(`hours.${index}.enabled`)
        return (
          <div
            key={field.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border p-3"
          >
            {/* On a phone the day takes the first line and both times share the second. */}
            <div className="flex basis-full items-center gap-4 sm:basis-auto">
              <Controller
                control={control}
                name={`hours.${index}.enabled`}
                render={({ field: switchField }) => (
                  <Switch checked={switchField.value} onCheckedChange={switchField.onChange} />
                )}
              />
              <span className="w-28 text-sm font-medium">{t(`weekday.${field.day}`)}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {(["start", "end"] as const).map((part, partIndex) => (
                <div key={part} className="flex items-center gap-2 sm:gap-4">
                  {partIndex === 1 && (
                    <span className="text-sm text-muted-foreground">{t("staff.rangeTo")}</span>
                  )}
                  <div className="w-[8.5rem]">
                    <Controller
                      control={control}
                      name={`hours.${index}.${part}`}
                      render={({ field: timeField }) => (
                        <BookingTimeField
                          id={`hours-${field.day}-${part}`}
                          value={timeField.value}
                          onChange={timeField.onChange}
                          options={HOUR_OPTIONS}
                          dateReady
                          disabled={!enabled}
                          invalid={!!errors.hours?.[index]?.[part]}
                        />
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
            {enabled && (errors.hours?.[index]?.start || errors.hours?.[index]?.end) && (
              <p role="alert" className="basis-full text-sm text-destructive">
                {errors.hours?.[index]?.start?.message ?? errors.hours?.[index]?.end?.message}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
