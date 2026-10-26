import { useTranslation } from "react-i18next"

export function PlaceholderPage({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{description ?? t("common.comingSoon")}</p>
    </div>
  )
}
