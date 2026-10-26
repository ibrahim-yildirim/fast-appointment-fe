import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"

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
import { useCreateCustomer } from "@/features/customers/hooks/useCreateCustomer"

export function AddCustomerDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const createCustomer = useCreateCustomer()
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, t("validation.nameRequired")).max(120),
        phone: z
          .string()
          .min(6, t("validation.phoneRequired"))
          .max(32, t("validation.phoneRequired"))
          .regex(/^[0-9+()\s-]+$/, t("validation.phoneRequired")),
        email: z.union([z.literal(""), z.email(t("validation.email"))]),
      }),
    [t],
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "" },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("customers.add")}</DialogTitle>
          <DialogDescription>{t("customers.addHint")}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) =>
            createCustomer.mutate(
              { ...values, name: values.name.trim() },
              { onSuccess: () => onOpenChange(false) },
            ),
          )}
          className="flex flex-col gap-5"
        >
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel required htmlFor="customer-name">
                {t("booking.fullName")}
              </FieldLabel>
              <Input id="customer-name" {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.phone}>
              <FieldLabel required htmlFor="customer-phone">
                {t("booking.phone")}
              </FieldLabel>
              <Input id="customer-phone" type="tel" {...register("phone")} />
              <FieldError errors={[errors.phone]} />
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="customer-email">{t("booking.emailOptional")}</FieldLabel>
              <Input id="customer-email" type="email" {...register("email")} />
              <FieldError errors={[errors.email]} />
            </Field>
          </FieldGroup>
          <Button type="submit" disabled={createCustomer.isPending}>
            {createCustomer.isPending ? t("common.saving") : t("customers.add")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
