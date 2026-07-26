import { useTranslation } from "react-i18next"

import { PlaceholderPage } from "@/components/layout/PlaceholderPage"

export function AccountSettingsPage() {
  const { t } = useTranslation()

  return <PlaceholderPage title={t("account.settings")} />
}
