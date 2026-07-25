import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { BusinessOnboardingInput } from "@/features/business-onboarding/schemas/businessOnboardingSchema"

const dayLabels: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
}

export function BusinessHoursStep({ form }: { form: UseFormReturn<BusinessOnboardingInput> }) {
  const { control, register, watch } = form
  const { fields } = useFieldArray({ control, name: "hours" })

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => {
        const enabled = watch(`hours.${index}.enabled`)
        return (
          <div key={field.id} className="flex items-center gap-4 rounded-lg border border-border p-3">
            <Controller
              control={control}
              name={`hours.${index}.enabled`}
              render={({ field: switchField }) => (
                <Switch checked={switchField.value} onCheckedChange={switchField.onChange} />
              )}
            />
            <span className="w-24 text-sm font-medium">{dayLabels[field.day]}</span>
            <Input
              type="time"
              className="w-32"
              disabled={!enabled}
              {...register(`hours.${index}.start`)}
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="time"
              className="w-32"
              disabled={!enabled}
              {...register(`hours.${index}.end`)}
            />
          </div>
        )
      })}
    </div>
  )
}
