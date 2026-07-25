import { PlusIcon, XIcon } from "lucide-react"
import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { AvailabilityFormInput } from "@/features/staff-calendar/schemas/availabilityFormSchema"
import { weekdayLabels } from "@/lib/constants"

export function AvailabilityDayRow({
  form,
  dayIndex,
}: {
  form: UseFormReturn<AvailabilityFormInput>
  dayIndex: number
}) {
  const { control, register, watch, formState } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: `weekly.${dayIndex}.ranges`,
  })
  const day = watch(`weekly.${dayIndex}.day`)
  const enabled = watch(`weekly.${dayIndex}.enabled`)
  const dayRangesError = formState.errors.weekly?.[dayIndex]?.ranges
  const dayErrorMessage = dayRangesError?.root?.message ?? dayRangesError?.message

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex items-center gap-4">
        <Controller
          control={control}
          name={`weekly.${dayIndex}.enabled`}
          render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
        />
        <span className="w-24 text-sm font-medium">{weekdayLabels[day]}</span>
        <div className="flex flex-1 flex-col gap-2">
          {fields.map((field, rangeIndex) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                type="time"
                className="w-32"
                disabled={!enabled}
                {...register(`weekly.${dayIndex}.ranges.${rangeIndex}.start`)}
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="time"
                className="w-32"
                disabled={!enabled}
                {...register(`weekly.${dayIndex}.ranges.${rangeIndex}.end`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={!enabled}
                onClick={() => remove(rangeIndex)}
                aria-label="Remove time range"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!enabled}
            onClick={() => append({ start: "09:00", end: "17:00" })}
            className="w-fit"
          >
            <PlusIcon className="h-4 w-4" />
            Add range
          </Button>
        </div>
      </div>
      {dayErrorMessage && <FieldError errors={[{ message: dayErrorMessage }]} />}
    </div>
  )
}
