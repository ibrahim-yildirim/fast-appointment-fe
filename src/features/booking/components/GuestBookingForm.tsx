import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  createGuestBookingSchema,
  type GuestBookingInput,
} from "@/features/booking/schemas/guestBookingSchema"

export function GuestBookingForm({
  isPending,
  onSubmit,
}: {
  isPending: boolean
  onSubmit: (values: GuestBookingInput) => void
}) {
  const { t } = useTranslation()
  const schema = useMemo(() => createGuestBookingSchema(t), [t])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestBookingInput>({
    resolver: zodResolver(schema),
    defaultValues: { guestName: "", guestPhone: "", guestEmail: "" },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold">{t("booking.yourDetails")}</h2>
        <p className="text-muted-foreground text-sm">{t("booking.yourDetailsHint")}</p>
      </div>
      <FieldGroup>
        <Field data-invalid={!!errors.guestName}>
          <FieldLabel required htmlFor="guest-name">
            {t("booking.fullName")}
          </FieldLabel>
          <Input id="guest-name" autoComplete="name" {...register("guestName")} />
          <FieldError errors={[errors.guestName]} />
        </Field>
        <Field data-invalid={!!errors.guestPhone}>
          <FieldLabel required htmlFor="guest-phone">
            {t("booking.phone")}
          </FieldLabel>
          <Input id="guest-phone" type="tel" autoComplete="tel" {...register("guestPhone")} />
          <FieldError errors={[errors.guestPhone]} />
        </Field>
        <Field data-invalid={!!errors.guestEmail}>
          <FieldLabel htmlFor="guest-email">{t("booking.emailOptional")}</FieldLabel>
          <Input id="guest-email" type="email" autoComplete="email" {...register("guestEmail")} />
          <FieldError errors={[errors.guestEmail]} />
        </Field>
      </FieldGroup>
      <Button type="submit" size="xl" disabled={isPending}>
        {isPending ? t("booking.confirming") : t("booking.confirm")}
      </Button>
    </form>
  )
}
