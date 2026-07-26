import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { AvailabilityDayRow } from "@/features/staff-calendar/components/AvailabilityDayRow"
import { useAddTimeOff } from "@/features/staff-calendar/hooks/useAddTimeOff"
import { useRemoveTimeOff } from "@/features/staff-calendar/hooks/useRemoveTimeOff"
import { useStaffAvailability } from "@/features/staff-calendar/hooks/useStaffAvailability"
import { useStaffMember } from "@/features/staff-calendar/hooks/useStaffMember"
import { useTimeOff } from "@/features/staff-calendar/hooks/useTimeOff"
import { useUpdateAvailability } from "@/features/staff-calendar/hooks/useUpdateAvailability"
import {
  createAvailabilityFormSchema,
  createTimeOffFormSchema,
  type AvailabilityFormInput,
  type TimeOffFormInput,
} from "@/features/staff-calendar/schemas/availabilityFormSchema"

export function StaffAvailabilityPage() {
  const { t } = useTranslation()
  const availabilitySchema = useMemo(() => createAvailabilityFormSchema(t), [t])
  const timeOffSchema = useMemo(() => createTimeOffFormSchema(t), [t])
  const business = useBusinessContext()
  const { staffId } = useParams<{ staffId: string }>()
  const { data: member } = useStaffMember(business.id, staffId!)
  const { data: weekly, isLoading } = useStaffAvailability(business.id, staffId!)
  const updateAvailability = useUpdateAvailability(business.id, staffId!)
  const { data: timeOff } = useTimeOff(business.id, staffId!)
  const addTimeOff = useAddTimeOff(business.id, staffId!)
  const removeTimeOff = useRemoveTimeOff(business.id, staffId!)

  const form = useForm<AvailabilityFormInput>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: { weekly: weekly ?? [] },
  })

  useEffect(() => {
    if (weekly) form.reset({ weekly })
  }, [weekly, form])

  const { fields: weeklyFields } = useFieldArray({ control: form.control, name: "weekly" })

  const timeOffForm = useForm<TimeOffFormInput>({
    resolver: zodResolver(timeOffSchema),
    defaultValues: { date: "", reason: "" },
  })

  function copyMondayToAll() {
    const monday = form.getValues("weekly.0")
    for (let index = 1; index < 7; index++) {
      form.setValue(`weekly.${index}.enabled`, monday.enabled, { shouldValidate: true })
      form.setValue(`weekly.${index}.ranges`, monday.ranges, { shouldValidate: true })
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{member ? t("staff.memberAvailability", { name: member.name }) : t("staff.weeklyHours")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <form
              onSubmit={form.handleSubmit((values) => updateAvailability.mutate(values.weekly))}
              className="flex flex-col gap-4"
            >
              <Button type="button" variant="outline" size="sm" className="w-fit" onClick={copyMondayToAll}>
                {t("staff.copyMonday")}
              </Button>
              <div className="flex flex-col gap-2">
                {weeklyFields.map((field, index) => (
                  <AvailabilityDayRow key={field.id} form={form} dayIndex={index} />
                ))}
              </div>
              <Button type="submit" disabled={updateAvailability.isPending} className="w-fit">
                {updateAvailability.isPending ? t("common.saving") : t("staff.saveAvailability")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("staff.timeOff")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form
            onSubmit={timeOffForm.handleSubmit((values) => {
              addTimeOff.mutate(values, { onSuccess: () => timeOffForm.reset() })
            })}
            className="flex items-end gap-2"
          >
            <FieldGroup className="flex-row items-end gap-2">
              <Field data-invalid={!!timeOffForm.formState.errors.date}>
                <FieldLabel required htmlFor="time-off-date">
                  {t("staff.date")}
                </FieldLabel>
                <Input id="time-off-date" type="date" {...timeOffForm.register("date")} />
                <FieldError errors={[timeOffForm.formState.errors.date]} />
              </Field>
              <Field data-invalid={!!timeOffForm.formState.errors.reason}>
                <FieldLabel required htmlFor="time-off-reason">
                  {t("staff.reason")}
                </FieldLabel>
                <Input id="time-off-reason" {...timeOffForm.register("reason")} />
                <FieldError errors={[timeOffForm.formState.errors.reason]} />
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={addTimeOff.isPending}>
              {t("staff.addTimeOff")}
            </Button>
          </form>

          <div className="flex flex-col gap-2">
            {timeOff && timeOff.length > 0 ? (
              timeOff.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>
                    {entry.date} &middot; {entry.reason}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTimeOff.mutate(entry.id)}
                  >
                    {t("staff.removeTimeOffAction")}
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t("staff.noTimeOff")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
