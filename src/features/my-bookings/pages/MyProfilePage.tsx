import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useMyProfile } from "@/features/customers/hooks/useMyProfile"
import { useUpdateMyProfile } from "@/features/customers/hooks/useUpdateMyProfile"
import type { Customer } from "@/types"

export function MyProfilePage() {
  const { t } = useTranslation()
  const { data: profile, isLoading } = useMyProfile()

  return (
    <div className="flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{t("account.profile")}</h1>
        <p className="text-sm text-muted-foreground">{t("account.profileHint")}</p>
      </div>
      {isLoading || !profile ? <Skeleton className="h-64 w-full" /> : <ProfileForm profile={profile} />}
    </div>
  )
}

function ProfileForm({ profile }: { profile: Customer }) {
  const { t } = useTranslation()
  const updateProfile = useUpdateMyProfile()
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, t("validation.nameRequired")).max(120),
        // Optional: an empty phone clears it, anything else must look like a number.
        phone: z.union([
          z.literal(""),
          z
            .string()
            .min(6, t("validation.phoneRequired"))
            .max(32, t("validation.phoneRequired"))
            .regex(/^[0-9+()\s-]+$/, t("validation.phoneRequired")),
        ]),
      }),
    [t],
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: profile.name, phone: profile.phone },
  })

  return (
    <form
      onSubmit={handleSubmit((values) =>
        updateProfile.mutate({ name: values.name.trim(), phone: values.phone.trim() }),
      )}
      className="flex flex-col gap-5"
    >
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel required htmlFor="profile-name">
            {t("booking.fullName")}
          </FieldLabel>
          <Input id="profile-name" autoComplete="name" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="profile-phone">{t("account.phoneOptional")}</FieldLabel>
          <Input id="profile-phone" type="tel" autoComplete="tel" {...register("phone")} />
          <FieldError errors={[errors.phone]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-email">{t("booking.email")}</FieldLabel>
          <Input id="profile-email" value={profile.email} readOnly disabled />
          <p className="text-sm text-muted-foreground">{t("account.emailFixed")}</p>
        </Field>
      </FieldGroup>
      <Button type="submit" className="self-start" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? t("common.saving") : t("common.save")}
      </Button>
    </form>
  )
}
