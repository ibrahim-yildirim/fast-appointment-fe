import { useTranslation } from "react-i18next"

import { PlaceholderPage } from "@/components/layout/PlaceholderPage"

export function DashboardSettingsPage() {
  const { t } = useTranslation()

  return <PlaceholderPage title={t("dashboard.settings")} />
}
