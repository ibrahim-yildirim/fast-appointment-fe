import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateOwnerBooking } from "@/features/booking/hooks/useCreateOwnerBooking"
import { minutesToTimeString, timeStringToMinutes } from "@/features/booking/lib/slotUtils"
import {
  createOwnerBookingSchema,
  type OwnerBookingInput,
} from "@/features/dashboard-bookings/schemas/ownerBookingSchema"
import { useCustomers } from "@/features/customers/hooks/useCustomers"
import { businessTodayKey, useFormatters } from "@/lib/datetime"
import type { Service, Staff } from "@/types"

export function NewBookingDialog({
  businessId,
  open,
  onOpenChange,
  services,
  staff,
  initialDate,
}: {
  businessId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  services: Service[]
  staff: Staff[]
  initialDate?: string
}) {
  const { t } = useTranslation()
  const { formatTime } = useFormatters()
  const schema = useMemo(() => createOwnerBookingSchema(t), [t])
  const { data: customers } = useCustomers()
  const createBooking = useCreateOwnerBooking(businessId)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<OwnerBookingInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceId: "",
      staffId: "",
      date: initialDate ?? businessTodayKey(),
      time: "",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      notes: "",
    },
  })

  const activeServices = services.filter((service) => service.active)
  const serviceId = useWatch({ control, name: "serviceId" })
  const time = useWatch({ control, name: "time" })
  const selectedService = activeServices.find((service) => service.id === serviceId)
  const eligibleStaff = staff.filter(
    (member) => member.active && selectedService?.eligibleStaffIds.includes(member.id),
  )
  const endTime =
    selectedService && /^\d{2}:\d{2}$/.test(time)
      ? minutesToTimeString(timeStringToMinutes(time) + selectedService.durationMinutes)
      : null

  function handleServiceChange(nextServiceId: string) {
    setValue("serviceId", nextServiceId, { shouldValidate: true })
    const nextService = activeServices.find((service) => service.id === nextServiceId)
    const nextStaff = staff.filter(
      (member) => member.active && nextService?.eligibleStaffIds.includes(member.id),
    )
    const currentStaffId = getValues("staffId")
    if (!nextStaff.some((member) => member.id === currentStaffId)) {
      // One eligible person is the common case in a small shop; save the extra click.
      setValue("staffId", nextStaff.length === 1 ? nextStaff[0].id : "")
    }
  }

  // Picking a known name from the notebook fills in the phone, so the booking links to that customer.
  function handleNameBlur() {
    const name = getValues("customerName").trim().toLocaleLowerCase("tr")
    if (!name || getValues("customerPhone")) return
    const match = (customers ?? []).find(
      (customer) => customer.phone && customer.name.toLocaleLowerCase("tr") === name,
    )
    if (match) setValue("customerPhone", match.phone, { shouldValidate: true })
  }

  function onSubmit(values: OwnerBookingInput) {
    if (!selectedService) return
    const startsAt = `${values.date}T${values.time}:00.000Z`
    const endsAt = new Date(
      new Date(startsAt).getTime() + selectedService.durationMinutes * 60_000,
    ).toISOString()
    createBooking.mutate(
      {
        serviceId: values.serviceId,
        staffId: values.staffId,
        startsAt,
        endsAt,
        customerName: values.customerName.trim(),
        customerPhone: values.customerPhone,
        customerEmail: values.customerEmail,
        notes: values.notes.trim(),
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dashboard.newBooking")}</DialogTitle>
          <DialogDescription>{t("dashboard.newBookingHint")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <FieldGroup>
            <Field data-invalid={!!errors.serviceId}>
              <FieldLabel required htmlFor="new-booking-service">
                {t("dashboard.form.service")}
              </FieldLabel>
              <Controller
                control={control}
                name="serviceId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={handleServiceChange}>
                    <SelectTrigger id="new-booking-service" className="w-full">
                      <SelectValue placeholder={t("dashboard.form.selectService")} />
                    </SelectTrigger>
                    <SelectContent>
                      {activeServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.serviceId]} />
            </Field>

            <Field data-invalid={!!errors.staffId}>
              <FieldLabel required htmlFor="new-booking-staff">
                {t("dashboard.form.staff")}
              </FieldLabel>
              <Controller
                control={control}
                name="staffId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedService || eligibleStaff.length === 0}
                  >
                    <SelectTrigger id="new-booking-staff" className="w-full">
                      <SelectValue placeholder={t("dashboard.form.selectStaff")} />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleStaff.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {selectedService && eligibleStaff.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("dashboard.form.noEligibleStaff")}</p>
              )}
              <FieldError errors={[errors.staffId]} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.date}>
                <FieldLabel required htmlFor="new-booking-date">
                  {t("dashboard.form.date")}
                </FieldLabel>
                <Input id="new-booking-date" type="date" {...register("date")} />
                <FieldError errors={[errors.date]} />
              </Field>
              <Field data-invalid={!!errors.time}>
                <FieldLabel required htmlFor="new-booking-time">
                  {t("dashboard.form.time")}
                </FieldLabel>
                <Input id="new-booking-time" type="time" step={300} {...register("time")} />
                <FieldError errors={[errors.time]} />
              </Field>
            </div>
            {endTime && (
              <p className="-mt-3 text-sm text-muted-foreground">
                {t("dashboard.form.endsAt", { time: formatTime(endTime) })}
              </p>
            )}

            <Field data-invalid={!!errors.customerName}>
              <FieldLabel required htmlFor="new-booking-name">
                {t("dashboard.form.customerName")}
              </FieldLabel>
              <Input
                id="new-booking-name"
                list="new-booking-customers"
                autoComplete="off"
                {...register("customerName", { onBlur: handleNameBlur })}
              />
              <datalist id="new-booking-customers">
                {(customers ?? []).map((customer) => (
                  <option key={customer.id} value={customer.name} />
                ))}
              </datalist>
              <FieldError errors={[errors.customerName]} />
            </Field>
            <Field data-invalid={!!errors.customerPhone}>
              <FieldLabel required htmlFor="new-booking-phone">
                {t("dashboard.form.customerPhone")}
              </FieldLabel>
              <Input id="new-booking-phone" type="tel" {...register("customerPhone")} />
              <FieldError errors={[errors.customerPhone]} />
            </Field>
            <Field data-invalid={!!errors.customerEmail}>
              <FieldLabel htmlFor="new-booking-email">{t("dashboard.form.customerEmail")}</FieldLabel>
              <Input id="new-booking-email" type="email" {...register("customerEmail")} />
              <FieldError errors={[errors.customerEmail]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-booking-notes">{t("dashboard.form.notes")}</FieldLabel>
              <Textarea id="new-booking-notes" rows={2} maxLength={500} {...register("notes")} />
            </Field>
          </FieldGroup>
          <Button type="submit" disabled={createBooking.isPending}>
            {createBooking.isPending ? t("dashboard.creatingBooking") : t("dashboard.createBooking")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
